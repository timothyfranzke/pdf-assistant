import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  generateFilePath, 
  saveFileToLocal, 
  extractPdfMetadata, 
  storePdfDocument 
} from "@/lib/pdf";

// Maximum file size (from environment variable or default to 10MB)
const MAX_FILE_SIZE = (parseInt(process.env.PDF_MAX_SIZE_MB || "10") * 1024 * 1024);

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "Untitled Document";

    // Validate file
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds the ${process.env.PDF_MAX_SIZE_MB || 10}MB limit` 
      }, { status: 400 });
    }

    // Convert file to buffer for processing
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a unique file path
    const filePath = generateFilePath(userId, file.name);

    // Save file to local storage
    await saveFileToLocal(fileBuffer, filePath);

    // Extract metadata (like page count)
    const { pageCount } = await extractPdfMetadata(fileBuffer);

    // Store document metadata in database
    const document = await storePdfDocument({
      userId,
      title,
      fileName: file.name,
      fileKey: filePath, // We use filePath as the fileKey in the local storage version
      fileSize: file.size,
      pageCount,
    });

    // Return success with document info
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        pageCount: document.pageCount,
        uploadedAt: document.uploadedAt,
      },
    });
    
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}