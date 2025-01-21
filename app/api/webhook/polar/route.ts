import { Webhooks } from "@polar-sh/nextjs";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { SupabaseClient } from "@supabase/supabase-js";

interface AuthUser {
	id: string;
	email: string;
}

async function findUserByEmailV2(supabase: SupabaseClient, customerEmail: string | undefined, eventType: string): Promise<AuthUser | null> {
	if (!customerEmail) {
		console.error(`[${eventType}] No customer email provided in webhook payload`);
		return null;
	}

	console.log(`[${eventType}] Looking up user by email:`, customerEmail);

	// Using RPC to safely access auth.users
	const { data: users, error: getUserError } = await supabase
		.rpc('get_auth_user_by_email_v2', {
			user_email: customerEmail.toLowerCase()
		});

	if (getUserError) {
		console.error(`[${eventType}] Error finding user:`, getUserError);
		return null;
	}

	// RPC returns an array, we need the first item
	const user = Array.isArray(users) ? users[0] : users;

	if (!user) {
		console.error(`[${eventType}] No user returned from lookup for email: ${customerEmail}`);
		return null;
	}

	if (!user.id || typeof user.id !== 'string') {
		console.error(`[${eventType}] Invalid user ID returned:`, user);
		return null;
	}

	console.log(`[${eventType}] Found user:`, { id: user.id, email: user.email });
	return {
		id: user.id,
		email: user.email
	};
}

async function updateUserPlan(
	supabase: SupabaseClient, 
	userId: string, 
	planId: number, 
	eventType: string,
	subscriptionData?: {
		currentPeriodStart?: string;
		currentPeriodEnd?: string;
		cancelAtPeriodEnd?: boolean;
	},
	polarCustomerId?: string
) {
	if (!userId) {
		console.error(`[${eventType}] No user ID provided for plan update`);
		return false;
	}

	console.log(`[${eventType}] Updating plan for user:`, { userId, planId, subscriptionData, polarCustomerId });

	// Check for existing active plan
	const { data: existingPlan, error: getPlanError } = await supabase
		.from('user_plans')
		.select('id')
		.eq('user_id', userId)
		.is('end_date', null)
		.single();

	if (getPlanError && getPlanError.code !== 'PGRST116') { // PGRST116 is "not found"
		console.error(`[${eventType}] Error checking existing plan:`, getPlanError);
		return false;
	}

	const now = new Date().toISOString();
	const usageTracking = {
		monthly_usage: 0,
		last_reset: now,
		last_usage: null
	};

	// Set dates from subscription data if available
	const startDate = subscriptionData?.currentPeriodStart || now;
	const endDate = subscriptionData?.cancelAtPeriodEnd ? subscriptionData.currentPeriodEnd : null;

	if (existingPlan) {
		console.log(`[${eventType}] Updating existing plan:`, existingPlan.id);
		// Update existing plan
		const { error: updateError } = await supabase
			.from('user_plans')
			.update({
				plan_id: planId,
				start_date: startDate,
				end_date: endDate,
				usage_tracking: usageTracking,
				cancellation_date: null, // Clear any cancellation if they're resubscribing
				...(polarCustomerId && { polar_customer_id: polarCustomerId })
			})
			.eq('id', existingPlan.id);

		if (updateError) {
			console.error(`[${eventType}] Error updating plan:`, updateError);
			return false;
		}
	} else {
		console.log(`[${eventType}] Creating new plan for user:`, userId);
		// Insert new plan
		const { error: insertError } = await supabase
			.from('user_plans')
			.insert({
				user_id: userId,
				plan_id: planId,
				start_date: startDate,
				end_date: endDate,
				usage_tracking: usageTracking,
				...(polarCustomerId && { polar_customer_id: polarCustomerId })
			});

		if (insertError) {
			console.error(`[${eventType}] Error inserting plan:`, insertError);
			return false;
		}
	}

	return true;
}

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		payload: any
	) => {
		const supabase = createServiceRoleClient();
		const metadata = payload.data.metadata || {};
		console.log(`[${payload.type}] Processing webhook event:`, {
			type: payload.type,
			metadata,
			customerEmail: payload.data.customer?.email,
			productName: payload.data.product?.name
		});

		switch (payload.type) {
			case 'order.created': {
				console.log(`[${payload.type}] Order created:`, payload.data);
				
				// Try to find user by metadata email first, then fall back to customer email
				const user = metadata.email ? 
					await findUserByEmailV2(supabase, metadata.email, payload.type) :
					await findUserByEmailV2(supabase, payload.data.customer?.email, payload.type);

				if (!user) return;

				// Map Polar product to our plan ID
				const planId = payload.data.product.name === 'Author Buddy Max' ? 3 : 1;
				
				// Update or create user plan with Polar customer ID
				const success = await updateUserPlan(
					supabase, 
					user.id, 
					planId, 
					payload.type,
					undefined,
					payload.data.customer?.id
				);
				if (success) {
					console.log(`[${payload.type}] Successfully updated plan for user ${user.email}`);
				}
				break;
			}

			case 'checkout.created': {
				console.log(`[${payload.type}] Checkout created:`, payload.data.product.name);
				break;
			}

			case 'subscription.created':
			case 'subscription.active':
			case 'subscription.updated': {
				// Try to find user by metadata email first
				const user = metadata.email ? 
					await findUserByEmailV2(supabase, metadata.email, payload.type) :
					await findUserByEmailV2(supabase, payload.data.customer?.email, payload.type);

				if (!user) return;

				// Map Polar product to our plan ID
				const planId = payload.data.product.name === 'Author Buddy Max' ? 3 : 1;
				
				// Update or create user plan with subscription dates and Polar customer ID
				const success = await updateUserPlan(
					supabase, 
					user.id, 
					planId, 
					payload.type, 
					{
						currentPeriodStart: payload.data.currentPeriodStart,
						currentPeriodEnd: payload.data.currentPeriodEnd,
						cancelAtPeriodEnd: payload.data.cancelAtPeriodEnd
					},
					payload.data.customer?.id
				);
				if (success) {
					console.log(`[${payload.type}] Successfully updated plan for user ${user.email}`);
				}
				break;
			}

			case 'subscription.canceled': {
				// Try metadata email first
				const user = metadata.email ? 
					await findUserByEmailV2(supabase, metadata.email, payload.type) :
					await findUserByEmailV2(supabase, payload.data.customer?.email, payload.type);

				if (!user) return;

				// Don't revoke access immediately
				// Just mark that the subscription will be canceled at period end
				const { error } = await supabase
					.from('user_plans')
					.update({
						cancellation_date: new Date().toISOString(),
						end_date: payload.data.currentPeriodEnd
					})
					.eq('user_id', user.id)
					.is('end_date', null);

				if (error) {
					console.error(`[${payload.type}] Error marking subscription as canceled:`, error);
					return;
				}

				console.log(`[${payload.type}] Successfully marked subscription as canceled for user ${user.email}`);
				break;
			}

			case 'subscription.revoked': {
				// Try metadata email first
				const user = metadata.email ? 
					await findUserByEmailV2(supabase, metadata.email, payload.type) :
					await findUserByEmailV2(supabase, payload.data.customer?.email, payload.type);

				if (!user) return;

				// Now we actually end the subscription immediately
				const { error } = await supabase
					.from('user_plans')
					.update({
						end_date: new Date().toISOString()
					})
					.eq('user_id', user.id)
					.is('end_date', null);

				if (error) {
					console.error(`[${payload.type}] Error ending subscription:`, error);
					return;
				}

				console.log(`[${payload.type}] Successfully ended subscription for user ${user.email}`);
				break;
			}

			case 'checkout.updated': {
				// Update the checkout status in our database
				const { error } = await supabase
					.from('checkouts')
					.update({
						status: payload.data.status,
						updated_at: new Date().toISOString()
					})
					.eq('id', payload.data.id);

				if (error) {
					console.error('Error updating checkout:', error);
				}
				break;
			}

			default:
				console.log(`[${payload.type}] Unknown event type:`, payload.type);
				break;
		}
	},
});
