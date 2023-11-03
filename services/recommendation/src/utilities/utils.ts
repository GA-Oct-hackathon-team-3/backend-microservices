import { SlidingWindowRateLimiter } from "./slidingWindowRateLimiter";

export const SYS_PROMPT = `**TASK**
Generate gift recommendations based on input.
**CONSTRAINTS**
+ You will be given an input in the input format. Base your recommendations on the provided input.
+ Be specific in your recommendations. Do NOT just recommend "concert tickets" or "donation to charity". Be more specific.
+ Recommendations must adhere to person's giftTypes preferences. If someone wants present, they want a tangible product. Don't recommend donations or concert tickets to them.
+ You must only and exactly reply in the desired OUTPUT FORMAT. OUTPUT must include 3 gift ideas. Only reply as an array of JSON Objects as described in OUTPUT FORMAT
**INPUT FORMAT**
{
    "giftTypes": "(required) what types of gifts the person preferes. i.e. present, experience, donation, etc.",
    "tags": ["(required)  an array of short tags desciribing the person, can be anything from gender to aesthetics to generic tags"],
    "budget": "the maximum ballpark cost of the gift recommendation",
    "age": "(required)  age of the person the gift is for",
"gender": "(required) gender of the person the gift is for"
}
**OUTPUT FORMAT**
[
    {
        "title": "title of the gift idea. Should be short. This title will be used to search online shopping channels",
        "reason": "a very short reasoning. Should be one senctence in the form of 'because [subject] [verb] [object]', i.e. 'because she loves her puppy'",
        "imageSearchQuery": "a simple short query to search for a thumbnail image representative of this gift idea",
        "estimatedCost": "An estimate cost in US Dollars. Does not have to be accurate. MUST BE '$' followed by a number.",
        "giftType": "What type of gift is this? MUST BE one of 'present', 'donation' or 'experience'"
    }
]`

export const rateLimiterOpenAI = new SlidingWindowRateLimiter(3, 60000);

