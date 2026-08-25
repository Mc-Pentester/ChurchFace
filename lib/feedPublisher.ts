import { prisma } from "@/lib/prisma";
import { createPostForEntity } from "@/lib/content";

/**
 * Feed Publisher - Centralized service for publishing module content to the Feed
 * 
 * This service provides specialized functions for each ChurchFace module
 * to publish their content as Feed Posts when appropriate.
 * 
 * Key principles:
 * - Only public content should be published to the Feed
 * - Use existing createPostForEntity for consistency
 * - Prevent duplicates via generatedType/generatedId
 * - Emit Socket.IO events for realtime updates
 */

/**
 * Publish a Prayer Request to the Feed
 */
export async function publishPrayerRequest({
  prayerRequestId,
  churchId,
  authorId,
}: {
  prayerRequestId: string;
  churchId: string;
  authorId: string;
}) {
  const prayer = await prisma.prayerRequest.findUnique({
    where: { id: prayerRequestId },
    select: {
      title: true,
      content: true,
      isUrgent: true,
      church: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!prayer) return null;

  // Only publish if it's urgent (policy decision)
  if (!prayer.isUrgent) return null;

  await createPostForEntity({
    churchId,
    type: "PRAYER_REQUEST",
    entityId: prayerRequestId,
    title: `🙏 ${prayer.title}`,
    summary: prayer.content?.substring(0, 200),
    authorId,
  });
}

/**
 * Publish a Prayer Chain to the Feed
 */
export async function publishPrayerChain({
  prayerChainId,
  churchId,
  authorId,
}: {
  prayerChainId: string;
  churchId: string;
  authorId: string;
}) {
  const chain = await prisma.prayerChain.findUnique({
    where: { id: prayerChainId },
    select: {
      title: true,
      description: true,
      visibility: true,
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!chain) return null;

  // Only publish if public
  if (chain.visibility !== "PUBLIC") return null;

  await createPostForEntity({
    churchId,
    type: "PRAYER_CHAIN",
    entityId: prayerChainId,
    title: `🙏 Nouvelle chaîne de prière`,
    summary: `${chain.title}\n${chain.description || ""}\n${chain._count.participants} intercesseurs`,
    authorId,
  });
}

/**
 * Publish a Prayer Campaign to the Feed
 */
export async function publishPrayerCampaign({
  prayerCampaignId,
  churchId,
  authorId,
}: {
  prayerCampaignId: string;
  churchId: string;
  authorId: string;
}) {
  const campaign = await prisma.prayerCampaign.findUnique({
    where: { id: prayerCampaignId },
    select: {
      title: true,
      description: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!campaign) return null;

  // PrayerCampaign is always published if associated with a church
  const dateRange = campaign.startDate && campaign.endDate
    ? `Du ${new Date(campaign.startDate).toLocaleDateString('fr-FR')} au ${new Date(campaign.endDate).toLocaleDateString('fr-FR')}`
    : "";

  await createPostForEntity({
    churchId,
    type: "PRAYER_CAMPAIGN",
    entityId: prayerCampaignId,
    title: `🎯 ${campaign.title}`,
    summary: `${campaign.description || ""}\n${dateRange}`,
    authorId,
  });
}

/**
 * Publish a Prayer Testimony to the Feed
 */
export async function publishPrayerTestimony({
  prayerRequestId,
  churchId,
  authorId,
}: {
  prayerRequestId: string;
  churchId: string;
  authorId: string;
}) {
  const testimony = await prisma.prayerTestimony.findUnique({
    where: { prayerRequestId },
    select: {
      content: true,
      imageUrl: true,
      prayerRequest: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!testimony) return null;

  await createPostForEntity({
    churchId,
    type: "TESTIMONY",
    entityId: prayerRequestId,
    title: `✨ Témoignage : ${testimony.prayerRequest.title}`,
    summary: testimony.content?.substring(0, 200),
    imageUrl: testimony.imageUrl,
    authorId,
  });
}

/**
 * Publish a Prayer Room to the Feed
 */
export async function publishPrayerRoom({
  prayerRoomId,
  churchId,
  authorId,
}: {
  prayerRoomId: string;
  churchId: string;
  authorId: string;
}) {
  const room = await prisma.prayerRoom.findUnique({
    where: { id: prayerRoomId },
    select: {
      title: true,
      description: true,
      roomType: true,
      isPublic: true,
      scheduledStart: true,
    },
  });

  if (!room) return null;

  // Only publish if public
  if (!room.isPublic) return null;

  const scheduledTime = room.scheduledStart
    ? `Programmé : ${new Date(room.scheduledStart).toLocaleString('fr-FR')}`
    : "";

  await createPostForEntity({
    churchId,
    type: "PRAYER_ROOM",
    entityId: prayerRoomId,
    title: `🙏 Salle de prière : ${room.title}`,
    summary: `${room.description || ""}\n${scheduledTime}`,
    authorId,
  });
}

/**
 * Publish a Church Event to the Feed
 */
export async function publishChurchEvent({
  eventId,
  churchId,
  authorId,
}: {
  eventId: string;
  churchId: string;
  authorId: string;
}) {
  const event = await prisma.churchEvent.findUnique({
    where: { id: eventId },
    select: {
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      location: true,
      imageUrl: true,
      isPublic: true,
    },
  });

  if (!event) return null;

  // Only publish if public
  if (!event.isPublic) return null;

  const dateStr = event.startDate
    ? new Date(event.startDate).toLocaleString('fr-FR')
    : "";

  await createPostForEntity({
    churchId,
    type: "EVENT",
    entityId: eventId,
    title: `📅 ${event.title}`,
    summary: `${event.description || ""}\n📍 ${event.location || ""}\n🕐 ${dateStr}`,
    imageUrl: event.imageUrl,
    authorId,
  });
}
