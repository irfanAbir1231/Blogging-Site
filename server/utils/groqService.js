import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Get content recommendations based on user health profile and post history
 * @param {Object} healthProfile - User's health profile
 * @param {Array} posts - Available posts
 * @param {Boolean} hasNutritionInterest - Whether user has nutrition interest
 * @returns {Array} - Recommended post IDs with reasoning
 */
export const getRecommendations = async (
  healthProfile,
  posts,
  hasNutritionInterest = false
) => {
  try {
    if (!healthProfile || !posts || posts.length === 0) {
      console.log("No health profile or posts available");
      return [];
    }

    console.log("Getting recommendations for profile:", {
      conditions: healthProfile.conditions,
      goals: healthProfile.goals,
      status: healthProfile.currentStatus
    });

    // Function to check if a post is nutrition-related
    const isNutritiousPost = (post) => {
      const nutritionKeywords = [
        "nutrition", "nutritious", "food", "diet", "eating", "meal", 
        "recipe", "healthy", "vegetable", "fruit", "protein"
      ];
      
      // Check tags
      const hasTags = post.tags && post.tags.some(tag => 
        nutritionKeywords.some(keyword => 
          tag.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      // Check categories
      const hasCategories = post.categories && 
        nutritionKeywords.some(keyword => 
          post.categories.toLowerCase().includes(keyword.toLowerCase())
        );
      
      // Check title and description
      const hasTitle = post.title && 
        nutritionKeywords.some(keyword => 
          post.title.toLowerCase().includes(keyword.toLowerCase())
        );
      
      const hasDescription = post.description && 
        nutritionKeywords.some(keyword => 
          post.description.toLowerCase().includes(keyword.toLowerCase())
        );
      
      return hasTags || hasCategories || hasTitle || hasDescription;
    };

    // Get relevant categories from GROQ
    const relevantCategories = await getRelevantCategories(healthProfile);
    console.log("Relevant categories for recommendations:", relevantCategories);

    if (relevantCategories.length === 0) {
      console.log("No relevant categories found");
      return [];
    }

    // Filter and score posts based on relevance
    const scoredPosts = posts.map(post => {
      let score = 0;
      let reasons = [];

      // Check if post matches relevant categories
      if (post.categories) {
        const postCategory = post.categories.toLowerCase();
        relevantCategories.forEach(category => {
          if (postCategory.includes(category.toLowerCase())) {
            score += 40;
            reasons.push(`Matches category: ${category}`);
          }
        });
      }

      // Check post tags
      if (post.tags && post.tags.length > 0) {
        const matchingTags = post.tags.filter(tag => 
          relevantCategories.some(category => 
            tag.toLowerCase().includes(category.toLowerCase())
          )
        );
        if (matchingTags.length > 0) {
          score += 20 * matchingTags.length;
          reasons.push(`Relevant tags: ${matchingTags.join(", ")}`);
        }
      }

      // Check title and description for category matches
      relevantCategories.forEach(category => {
        if (post.title && post.title.toLowerCase().includes(category.toLowerCase())) {
          score += 15;
          reasons.push(`Title matches ${category}`);
        }
        if (post.description && post.description.toLowerCase().includes(category.toLowerCase())) {
          score += 10;
          reasons.push(`Content related to ${category}`);
        }
      });

      // Check if post matches user's conditions
      if (healthProfile.conditions && healthProfile.conditions.length > 0) {
        healthProfile.conditions.forEach(condition => {
          if (condition && post.title && post.title.toLowerCase().includes(condition.toLowerCase())) {
            score += 30;
            reasons.push(`Matches health condition: ${condition}`);
          }
          if (condition && post.description && post.description.toLowerCase().includes(condition.toLowerCase())) {
            score += 20;
            reasons.push(`Content related to condition: ${condition}`);
          }
        });
      }

      // Check if post matches user's goals
      if (healthProfile.goals && healthProfile.goals.length > 0) {
        healthProfile.goals.forEach(goal => {
          if (goal && post.title && post.title.toLowerCase().includes(goal.toLowerCase())) {
            score += 25;
            reasons.push(`Matches health goal: ${goal}`);
          }
          if (goal && post.description && post.description.toLowerCase().includes(goal.toLowerCase())) {
            score += 15;
            reasons.push(`Content related to goal: ${goal}`);
          }
        });
      }

      // Check if post is nutrition-related when user has nutrition interest
      if (hasNutritionInterest && isNutritiousPost(post)) {
        score += 35;
        reasons.push("Matches nutrition interest");
      }

      // Boost recent posts slightly
      const postAge = Date.now() - new Date(post.createdDate).getTime();
      const daysOld = postAge / (1000 * 60 * 60 * 24);
      if (daysOld < 7) {
        score += 10;
        reasons.push("Recent post");
      }

      // Always give some base score for nutrition-related posts
      if (isNutritiousPost(post)) {
        score += 15;
        if (!reasons.includes("Nutrition-related content")) {
          reasons.push("Nutrition-related content");
        }
      }

      // Check current status for nutrition interest
      if (healthProfile.currentStatus && 
          healthProfile.currentStatus.toLowerCase().includes("nutritious") &&
          isNutritiousPost(post)) {
        score += 25;
        reasons.push("Matches current nutrition interest");
      }

      return {
        ...post.toObject(),
        relevanceScore: score,
        reasoning: reasons.join(". "),
        matchedCategories: relevantCategories,
        isNutritious: isNutritiousPost(post)
      };
    });

    // Filter posts with some relevance and sort by score
    const recommendations = scoredPosts
      .filter(post => post.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    console.log(`Found ${recommendations.length} recommendations`);
    return recommendations;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};

/**
 * Get relevant health categories based on user input
 * @param {Object} healthProfile - User's health profile
 * @returns {Array} - Relevant health categories
 */
export const getRelevantCategories = async (healthProfile) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY not found in environment");
      return [];
    }

    const categories = [
      "Nutrition",
      "Mental Health",
      "Exercise",
      "Chronic Diseases",
      "Healthy Living"
    ];

    const prompt = `You are a health category classifier. Based on the user's health profile, determine which of these categories are most relevant: ${categories.join(", ")}

User's Health Profile:
- Current Status: ${healthProfile.currentStatus || "None"}
- Health Conditions: ${healthProfile.conditions?.join(", ") || "None"}
- Health Goals: ${healthProfile.goals?.join(", ") || "None"}

Return your response as a JSON array containing ONLY the matching category names from the list provided. For example: ["Nutrition", "Exercise"]

Consider:
1. Direct mentions of categories
2. Synonyms or related terms
3. Implied health needs
4. Current status context

Return only categories from the provided list that are clearly relevant to the user's health profile.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a health category classifier that matches user health profiles to relevant health categories.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.2,
      max_tokens: 100,
      top_p: 0.9,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || "[]";
    console.log("GROQ Response:", responseContent);

    try {
      const parsedResponse = JSON.parse(responseContent);
      const relevantCategories = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.categories || [];
      
      // Validate that returned categories are from our list
      const validCategories = relevantCategories.filter(cat => categories.includes(cat));
      console.log("Valid categories:", validCategories);
      
      return validCategories;
    } catch (error) {
      console.error("Error parsing GROQ response:", error);
      return [];
    }
  } catch (error) {
    console.error("Error getting relevant categories:", error);
    return [];
  }
};

/**
 * Check if user has nutrition-related interests based on their profile
 * @param {Object} healthProfile - User's health profile
 * @returns {Boolean} - Whether user has nutrition interest
 */
const checkNutritionInterest = (healthProfile) => {
  const nutritionKeywords = [
    "nutrition",
    "nutritious",
    "food",
    "diet",
    "eating",
    "meal",
    "weight",
    "healthy eating",
    "balanced diet",
    "nutrients",
    "vitamins",
    "protein",
  ];

  // Check goals
  const hasNutritionGoal = healthProfile.goals.some((goal) =>
    nutritionKeywords.some((keyword) =>
      goal.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  // Check current status
  const hasNutritionStatus = nutritionKeywords.some((keyword) =>
    healthProfile.currentStatus.toLowerCase().includes(keyword.toLowerCase())
  );

  return hasNutritionGoal || hasNutritionStatus;
};

/**
 * Boost relevance scores for posts with nutrition-related tags
 * @param {Array} recommendations - Original recommendations
 * @param {Array} posts - All available posts
 * @returns {Array} - Recommendations with boosted scores
 */
const boostNutritionPosts = (recommendations, postsData) => {
  return recommendations.map((rec) => {
    const post = postsData.find((p) => p.id === rec.postId);

    if (post) {
      // Check if post is nutrition-related
      const nutritionKeywords = [
        "nutrition",
        "nutritious",
        "food",
        "diet",
        "eating",
        "meal",
        "recipe",
        "healthy",
        "vegetable",
        "fruit",
        "protein",
      ];

      // Check tags
      const hasTags =
        post.tags &&
        post.tags.some((tag) =>
          nutritionKeywords.some((keyword) =>
            tag.toLowerCase().includes(keyword.toLowerCase())
          )
        );

      // Check categories
      const hasCategories =
        post.categories &&
        post.categories.some((category) =>
          nutritionKeywords.some((keyword) =>
            category.toLowerCase().includes(keyword.toLowerCase())
          )
        );

      // Check title and description
      const hasTitle =
        post.title &&
        nutritionKeywords.some((keyword) =>
          post.title.toLowerCase().includes(keyword.toLowerCase())
        );

      const hasDescription =
        post.description &&
        nutritionKeywords.some((keyword) =>
          post.description.toLowerCase().includes(keyword.toLowerCase())
        );

      // Boost score if nutrition-related
      if (hasTags || hasCategories || hasTitle || hasDescription) {
        const boostAmount = 15; // Boost by 15 points (but don't exceed 100)
        const newScore = Math.min(100, rec.relevanceScore + boostAmount);

        return {
          ...rec,
          relevanceScore: newScore,
          reasoning: rec.reasoning + " (Boosted due to nutrition content)",
        };
      }
    }

    return rec;
  });
};

/**
 * Analyze user's current health status update
 * @param {String} previousStatus - User's previous status update
 * @param {String} currentStatus - User's current status update
 * @param {Object} profile - User's health profile
 * @returns {Object} - Analysis of the status update
 */
export const analyzeHealthStatus = async (
  previousStatus,
  currentStatus,
  profile
) => {
  try {
    if (!currentStatus) {
      return null;
    }

    // Check if status mentions nutrition
    const nutritionKeywords = [
      "nutrition",
      "nutritious",
      "food",
      "diet",
      "eating",
      "meal",
      "recipe",
      "healthy",
      "vegetable",
      "fruit",
      "protein",
    ];

    const mentionsNutrition = nutritionKeywords.some((keyword) =>
      currentStatus.toLowerCase().includes(keyword.toLowerCase())
    );

    // Create a prompt for the AI
    let prompt = `Analyze the user's health status update and identify any health conditions or changes mentioned.

Previous status: ${previousStatus || "None"}
Current status: ${currentStatus}

User's existing health conditions: ${profile.conditions.join(", ") || "None"}
User's health goals: ${profile.goals.join(", ") || "None"}

`;

    if (mentionsNutrition) {
      prompt += `The user has mentioned nutrition or food in their status update. Please pay special attention to any dietary needs, preferences, or nutrition-related health concerns.

`;
    }

    prompt += `Please analyze the status update and provide:
1. Any specific health condition mentioned or implied
2. Whether this is a new condition or an update to an existing one
3. Whether the user needs dietary or nutrition advice based on their status

Format your response as a JSON object with the following structure:
{
  "condition": "identified health condition or null if none detected",
  "isNew": true/false,
  "needsNutrition": true/false,
  "analysis": "brief analysis of the status update"
}

Only include the JSON object in your response, with no additional text.`;

    // Call the AI model
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a health analysis system that identifies health conditions and provides insights from user status updates.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 512,
      top_p: 0.9,
      response_format: { type: "json_object" },
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content || "{}";

    try {
      return JSON.parse(responseContent);
    } catch (error) {
      console.error("Error parsing AI analysis response:", error);
      return null;
    }
  } catch (error) {
    console.error("Error analyzing health status:", error);
    return null;
  }
};

// Helper function to check if a post is nutrition-related
const isNutritiousPost = (post) => {
  const nutritionKeywords = [
    "nutrition",
    "nutritious",
    "food",
    "diet",
    "eating",
    "meal",
    "recipe",
    "healthy",
    "vegetable",
    "fruit",
    "protein",
  ];

  // Check tags
  const hasTags =
    post.tags &&
    post.tags.some((tag) =>
      nutritionKeywords.some((keyword) =>
        tag.toLowerCase().includes(keyword.toLowerCase())
      )
    );

  // Check categories
  const hasCategories =
    post.categories &&
    post.categories.some((category) =>
      nutritionKeywords.some((keyword) =>
        category.toLowerCase().includes(keyword.toLowerCase())
      )
    );

  // Check title and description
  const hasTitle =
    post.title &&
    nutritionKeywords.some((keyword) =>
      post.title.toLowerCase().includes(keyword.toLowerCase())
    );

  const hasDescription =
    post.description &&
    nutritionKeywords.some((keyword) =>
      post.description.toLowerCase().includes(keyword.toLowerCase())
    );

  return hasTags || hasCategories || hasTitle || hasDescription;
};
