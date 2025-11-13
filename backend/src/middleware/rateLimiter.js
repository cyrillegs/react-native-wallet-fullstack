import rateLimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // here we just kept it simple.
    // in a real-world-app you'd like to put the userId or ipAddress as you key
    const { success } = await rateLimit.limit("my-rate-limits");

    // @upstash/ratelimit:my-rate-limit:29370909

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
