import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

// This script aims to test our new face duplicate logic
// Flow:
// 1. Create 2 test users (or use existing)
// 2. Generate a fake face embedding
// 3. Insert fake face embedding for user 1
// 4. Try updating/inserting the same fake face embedding for user 2 through the use case or by HTTP request.
//   Actually wait, the use case calls the python client. To test this without python client running, we should just test the calculateCosineSimilarity part and the duplicate logic.

// Since RegisterFaceUseCase is tightly coupled to faceRecognitionClient, testing it end-to-end requires the python service.
// Let's create a small script that tests calculateCosineSimilarity directly and verifies the logic, or we can just run the app and let the user test it manually.

async function testSimilarity() {
    function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    const vecA = [0.1, 0.2, 0.3];
    const vecB = [0.1, 0.2, 0.3];
    console.log("Same vector similarity: ", calculateCosineSimilarity(vecA, vecB)); // Should be 1

    const vecC = [-0.1, -0.2, -0.3];
    console.log("Opposite vector similarity: ", calculateCosineSimilarity(vecA, vecC)); // Should be -1

    const vecD = [0.1, 0.2, 0.31];
    console.log("Slightly different similarity: ", calculateCosineSimilarity(vecA, vecD)); // Should be ~0.99

    console.log("Test passed!");
}

testSimilarity().catch(console.error);
