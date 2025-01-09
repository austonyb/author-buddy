import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

export function extractExtraDetailsFromHtml($: cheerio.CheerioAPI) {
    const scripts = $('script');
  
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = $(scripts[i]).html() || '';
  
      if (scriptContent.includes('config') && scriptContent.includes('requestContext')) {
        try {
          const configMatch = scriptContent.match(/config\s*=\s*({[\s\S]*?});/);
          if (configMatch) {
            const config = JSON.parse(configMatch[1]);
            const requestContext = config.requestContext;
  
            return {
              obfuscatedMarketplaceId: requestContext.obfuscatedMarketplaceId,
              obfuscatedMerchantId: requestContext.obfuscatedMerchantId,
              sessionId: requestContext.sessionId,
              slateToken: requestContext.slateToken,
              freshCartCsrfToken: requestContext.freshCartCsrfToken,
              amazonApiCsrfToken: requestContext.amazonApiCsrfToken,
              visitId: requestContext.appendedParameters.visitId,
            };
          }
        } catch (error) {
          console.error('Error parsing script for extra details:', error);
          continue;
        }
      }
    }
  
    return null;
  }