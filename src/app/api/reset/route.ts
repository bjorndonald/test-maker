import AstraService from "@/services/AstraService"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: NextRequest) => {
    try {
        const { id } = await req.json()
        const vectorDBService = await AstraService.from(id)

        vectorDBService.deleteDoc(id)
        return NextResponse.json({})
    } catch (error) {
        return NextResponse.json(error, { status: 500 })
    }
}