export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { token } = body;

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Token is required",
      });
    }

    const config = useRuntimeConfig();
    const secretKey = config.turnstileSecretKey;

    if (!secretKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Turnstile secret key is not configured",
      });
    }

    // Cloudflare Turnstileの検証APIを呼び出し
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Turnstile verification failed",
      });
    }

    return {
      success: true,
      message: "Token verified successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
