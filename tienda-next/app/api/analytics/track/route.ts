/**
 * 📊 ENDPOINT: TRACK ANALYTICS
 * 
 * POST /api/analytics/track
 * 
 * Recibe eventos de analytics del cliente y los guarda en Firestore
 * con permisos de admin (sin depender de la autenticación del cliente)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase-admin/firestore";

const ANALYTICS_COLLECTION = "analytics";

function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, deviceId } = body;

    if (!eventType || !deviceId) {
      return NextResponse.json(
        { error: "Missing eventType or deviceId" },
        { status: 400 }
      );
    }

    const today = getTodayDate();
    const docRef = doc(db, ANALYTICS_COLLECTION, today);

    if (eventType === "pageView") {
      // Track page view
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        if (!data.visitorIds || !data.visitorIds.includes(deviceId)) {
          const updatedVisitors = [...(data.visitorIds || []), deviceId];
          await updateDoc(docRef, {
            visitorIds: updatedVisitors,
            uniqueVisitors: increment(1),
            lastUpdated: serverTimestamp(),
          });
        }
      } else {
        await setDoc(docRef, {
          date: today,
          uniqueVisitors: 1,
          visitorIds: [deviceId],
          totalClicks: 0,
          clicksByType: {
            productClick: 0,
            categoryClick: 0,
            buttonClick: 0,
            linkClick: 0,
          },
          lastUpdated: serverTimestamp(),
        });
      }
    } else if (eventType === "click") {
      // Track click
      const clickType = body.clickType || "buttonClick";
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const updateData: any = {
          totalClicks: increment(1),
          lastUpdated: serverTimestamp(),
        };
        updateData[`clicksByType.${clickType}`] = increment(1);

        await updateDoc(docRef, updateData);
      } else {
        const newClicksByType = {
          productClick: 0,
          categoryClick: 0,
          buttonClick: 0,
          linkClick: 0,
        };
        (newClicksByType as any)[clickType] = 1;

        await setDoc(docRef, {
          date: today,
          uniqueVisitors: 0,
          visitorIds: [],
          totalClicks: 1,
          clicksByType: newClicksByType,
          lastUpdated: serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Analytics API] Error:", error);
    // Don't expose error details to client
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
