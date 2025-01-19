import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@/utils/supabase/server";

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (payload) => {
		const supabase = await createClient();

		switch (payload.type) {
			case 'checkout.created': {
				// Track the checkout in our database
				const { data, error } = await supabase
					.from('checkouts')
					.insert({
						id: payload.data.id,
						status: payload.data.status,
						user_id: payload.data.customerId,
						product_id: payload.data.productId,
						created_at: new Date(payload.data.createdAt).toISOString()
					});

				if (error) {
					console.error('Error inserting checkout:', error);
				}
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

			case 'subscription.created':
			case 'subscription.active': {
				// Get the plan ID from the plans table
				const { data: planData } = await supabase
					.from('plans')
					.select('id')
					.eq('name', payload.data.product.name)
					.single();

				if (!planData?.id) {
					console.error('Plan not found:', payload.data.product.name);
					return;
				}

				// Update or insert user plan
				const { data: existingPlan } = await supabase
					.from('user_plans')
					.select()
					.eq('user_id', payload.data.customerId)
					.is('end_date', null)
					.single();

				if (existingPlan) {
					// Update existing plan
					const { error } = await supabase
						.from('user_plans')
						.update({
							plan_id: planData.id,
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
						console.error('Error updating user plan:', error);
					}
				} else {
					// Insert new plan
					const { error } = await supabase
						.from('user_plans')
						.insert({
							user_id: payload.data.customerId,
							plan_id: planData.id,
							start_date: new Date().toISOString(),
							usage_tracking: {
								monthly_usage: 0,
								last_reset: new Date().toISOString(),
								last_usage: null
							}
						});

					if (error) {
						console.error('Error inserting user plan:', error);
					}
				}
				break;
			}

			case 'subscription.updated': {
				// Handle subscription updates if needed
				console.log('Subscription updated:', payload.data);
				break;
			}

			case 'subscription.canceled': {
				// Don't revoke access immediately
				// Just mark that the subscription will be canceled
				const { error } = await supabase
					.from('user_plans')
					.update({
						cancellation_date: new Date().toISOString()
					})
					.eq('user_id', payload.data.customerId)
					.is('end_date', null);

				if (error) {
					console.error('Error marking subscription as canceled:', error);
				}
				break;
			}

			case 'subscription.revoked': {
				// Now we actually end the subscription
				const { error } = await supabase
					.from('user_plans')
					.update({
						end_date: new Date().toISOString()
					})
					.eq('user_id', payload.data.customerId)
					.is('end_date', null);

				if (error) {
					console.error('Error ending subscription:', error);
				}
				break;
			}

			default:
				console.log('Unknown event', payload.type);
				break;
		}
	}
});
