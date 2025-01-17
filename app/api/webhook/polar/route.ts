import { createClient } from "@/utils/supabase/server";
import {
	validateEvent,
	WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const requestBody = await request.text();
	const webhookHeaders = {
		"webhook-id": request.headers.get("webhook-id") ?? "",
		"webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
		"webhook-signature": request.headers.get("webhook-signature") ?? "",
	};

	let webhookPayload: ReturnType<typeof validateEvent>;
	try {
		webhookPayload = validateEvent(
			requestBody,
			webhookHeaders,
			process.env.POLAR_WEBHOOK_SECRET ?? "",
		);
	} catch (error) {
		if (error instanceof WebhookVerificationError) {
			return new NextResponse("", { status: 403 });
		}
		throw error;
	}

	console.log("Incoming Webhook", webhookPayload.type);
	const supabase = await createClient();

	// Handle the event
	switch (webhookPayload.type) {
		case "subscription.created":
		case "subscription.active": {
			const subscription = JSON.parse(requestBody);
			const userId = subscription.subscriber.id;
			const planName = subscription.product.name;

			// Get the plan ID from the plans table
			const { data: planData } = await supabase
				.from('plans')
				.select('id')
				.eq('name', planName)
				.single();

			if (!planData?.id) {
				console.error('Plan not found:', planName);
				return new NextResponse("Plan not found", { status: 400 });
			}

			// Update or insert user plan
			const { data: existingPlan } = await supabase
				.from('user_plans')
				.select()
				.eq('user_id', userId)
				.is('end_date', null)
				.single();

			if (existingPlan) {
				// Update existing plan
				await supabase
					.from('user_plans')
					.update({
						plan_id: planData.id,
						start_date: new Date().toISOString(),
						total_usage: 0
					})
					.eq('id', existingPlan.id);
			} else {
				// Insert new plan
				await supabase
					.from('user_plans')
					.insert({
						user_id: userId,
						plan_id: planData.id,
						start_date: new Date().toISOString(),
						total_usage: 0
					});
			}
			break;
		}

		case "subscription.updated": {
			// Handle plan updates if needed
			break;
		}

		case "subscription.canceled":
		case "subscription.revoked": {
			const subscription = JSON.parse(requestBody);
			const userId = subscription.subscriber.id;

			// Mark the current plan as ended
			await supabase
				.from('user_plans')
				.update({
					end_date: new Date().toISOString()
				})
				.eq('user_id', userId)
				.is('end_date', null);
			break;
		}

		default:
			console.log(`Unhandled event type ${webhookPayload.type}`);
	}

	return new NextResponse("", { status: 200 });
}
