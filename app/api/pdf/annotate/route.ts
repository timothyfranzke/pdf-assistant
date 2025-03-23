import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveAnnotation } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    
    // Validate request body
    if (!body.documentId || !body.pageNumber || !body.position || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user has access to the document
    const document = await db.document.findUnique({
      where: {
        id: body.documentId,
        userId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Create the annotation
    const annotation = await saveAnnotation({
      documentId: body.documentId,
      type: body.type,
      content: body.content,
      pageNumber: body.pageNumber,
      position: body.position,
      color: body.color || "#FFEB3B", // Default to yellow if not specified
      messageId: body.messageId,
    });

    return NextResponse.json({
      success: true,
      annotation,
    });
    
  } catch (error) {
    console.error("Error creating annotation:", error);
    return NextResponse.json(
      { error: "Failed to create annotation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const documentId = url.searchParams.get("documentId");
    
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    // Verify user has access to the document
    const document = await db.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Get annotations for the document
    const annotations = await db.annotation.findMany({
      where: {
        documentId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      annotations,
    });
    
  } catch (error) {
    console.error("Error fetching annotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch annotations" },
      { status: 500 }
    );
  }
}