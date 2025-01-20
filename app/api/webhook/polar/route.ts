import { Webhooks } from "@polar-sh/nextjs";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { SupabaseClient } from "@supabase/supabase-js";

async function findUserById(supabase: SupabaseClient, userId: string | undefined, eventType: string) {
	if (!userId) {
		console.error(`[${eventType}] No user ID provided in webhook payload metadata`);
		return null;
	}

	const { data: existingUser, error: getUserError } = await supabase
		.from('auth.users')
		.select('id, email')
		.eq('id', userId)
		.single();

	if (getUserError) {
		console.error(`[${eventType}] Error finding user:`, getUserError);
		return null;
	}

	if (!existingUser) {
		console.error(`[${eventType}] User not found in Supabase auth with ID: ${userId}`);
		return null;
	}

	return existingUser;
}

async function findUserByEmail(supabase: SupabaseClient, customerEmail: string | undefined, eventType: string) {
	if (!customerEmail) {
		console.error(`[${eventType}] No customer email provided in webhook payload`);
		return null;
	}

	const { data: existingUser, error: getUserError } = await supabase
		.from('auth.users')
		.select('id, email')
		.eq('email', customerEmail)
		.single();

	if (getUserError && getUserError.code !== 'PGRST116') { // PGRST116 is "not found"
		console.error(`[${eventType}] Error finding user:`, getUserError);
		return null;
	}

	if (!existingUser) {
		console.error(`[${eventType}] User not found in Supabase auth. This usually means the customer used a different email (${customerEmail}) to purchase than what they signed up with. They will need to contact support to link their accounts.`);
		return null;
	}

	return existingUser;
}

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (payload: any) => {
		const supabase = createServiceRoleClient();
		console.log(`[${payload.type}] Processing webhook event for customer ${payload.data.metadata.customer_id}`);

		switch (payload.type) {
			case 'checkout.created': {
				console.log(`checkout created:`, payload.data.product.name);
				break;
			}

			case 'subscription.created':
			case 'subscription.active': {
				// First try to find user by ID from metadata
				let user = payload.data.metadata?.customer_id ? 
					await findUserById(supabase, payload.data.metadata.customer_id, payload.type) :
					null;

				// Fall back to email lookup if no user found by ID
				if (!user) {
					user = await findUserByEmail(supabase, payload.data.customer?.email, payload.type);
					if (!user) return;
				}

				// Map Polar product to our plan ID
				const planId = payload.data.product.name === 'Author Buddy Max' ? 3 : 1;

				// Update or insert user plan
				const { data: existingPlan } = await supabase
					.from('user_plans')
					.select()
					.eq('user_id', user.id)
					.is('end_date', null)
					.single();

				if (existingPlan) {
					// Update existing plan
					const { error } = await supabase
						.from('user_plans')
						.update({
							plan_id: planId,
							start_date: new Date().toISOString(),
							usage_tracking: {
								monthly_usage: 0,
								last_reset: new Date().toISOString(),
								last_usage: null
							},
							// Clear any cancellation date if they're resubscribing
							cancellation_date: null
						})
						.eq('id', existingPlan.id);

					if (error) {
						console.error(`[${payload.type}] Error updating user plan:`, error);
						return;
					}

					console.log(`[${payload.type}] Successfully updated plan for user ${user.email}`);
				} else {
					// Insert new plan
					const { error } = await supabase
						.from('user_plans')
						.insert({
							user_id: user.id,
							plan_id: planId,
							start_date: new Date().toISOString(),
							usage_tracking: {
								monthly_usage: 0,
								last_reset: new Date().toISOString(),
								last_usage: null
							}
						});

					if (error) {
						console.error(`[${payload.type}] Error inserting user plan:`, error);
						return;
					}

					console.log(`[${payload.type}] Successfully created new plan for user ${user.email}`);
				}
				break;
			}

			case 'subscription.updated': {
				console.log(`[${payload.type}] Subscription updated:`, payload.data);
				break;
			}

			case 'subscription.canceled': {
				const user = await findUserByEmail(supabase, payload.data.customer?.email, payload.type);
				if (!user) return;

				// Don't revoke access immediately
				// Just mark that the subscription will be canceled
				const { error } = await supabase
					.from('user_plans')
					.update({
						cancellation_date: new Date().toISOString()
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
				const user = await findUserByEmail(supabase, payload.data.customer?.email, payload.type);
				if (!user) return;

				// Now we actually end the subscription
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
				const { data, error } = await supabase
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
	}
});
