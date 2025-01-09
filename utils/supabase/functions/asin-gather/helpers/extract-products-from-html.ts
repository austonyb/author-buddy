import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

import { extractExtraDetailsFromHtml } from './extract-extra-details-from-html.ts';
import { fetchMissingAsins } from './fetch-missing-asins.ts';

import type { AmazonProduct } from '../types.ts';

export async function extractProductsFromHtml($: cheerio.CheerioAPI) {
  const scripts = $('script');
  
  for (let i = 0; i < scripts.length; i++) {
      const scriptContent = $(scripts[i]).html() || '';
      
      if (scriptContent.includes('config') && scriptContent.includes('content')) {
          try {
              const configMatch = scriptContent.match(/config\s*=\s*({[\s\S]*?});/);
              if (configMatch) {
                  const config = JSON.parse(configMatch[1]);
                  if (config.content?.products) {
                      const products = config.content.products;
                      const additionalAsins = new Set(config.content.ASINList || []);
                      
                      let productsData = products.map((product: AmazonProduct) => ({
                          asin: product.asin,
                          author: product.byLine?.contributors?.[0]?.name || 'N/A',
                          rating: product.customerReviewsSummary?.rating?.shortDisplayString || 'N/A',
                          type: product.productCategory?.productType || 'N/A',
                          title: product.title?.displayString || 'N/A',
                          url: `https://www.amazon.com${product.detailPageLinkURL || 'N/A'}`,
                          price: product.buyingOptions?.[0]?.price?.priceToPay?.moneyValueOrRange?.value?.amount || 'N/A'
                      }));

                      const existingAsins = new Set(productsData.map((p: { asin: string }) => p.asin));
                      const missingAsins = Array.from(additionalAsins).filter(asin => !existingAsins.has(asin));

                      if (missingAsins.length > 0) {
                          const extraDetails = extractExtraDetailsFromHtml($);
                          if (extraDetails) {
                              const BATCH_SIZE = 16;
                              const batches = [];
                              
                              for (let i = 0; i < missingAsins.length; i += BATCH_SIZE) {
                                  batches.push(missingAsins.slice(i, i + BATCH_SIZE));
                              }
                              
                              const additionalProducts = [];
                              for (const batch of batches) {
                                  const missingProducts = await fetchMissingAsins({
                                      asins: batch as string[],
                                      config: extraDetails,
                                  });
                                  
                                  const batchProducts = missingProducts.map((product: AmazonProduct) => ({
                                      asin: product.asin,
                                      author: product.byLine?.contributors?.[0]?.name || 'N/A',
                                      rating: product.customerReviewsSummary?.rating?.shortDisplayString || 'N/A',
                                      type: product.productCategory?.productType || 'N/A',
                                      title: product.title?.displayString || 'N/A',
                                      url: `https://www.amazon.com${product.detailPageLinkURL || `/dp/${product.asin}`}`,
                                      price: product.buyingOptions?.[0]?.price?.priceToPay?.moneyValueOrRange?.value?.amount || 'N/A'
                                  }));
                                  additionalProducts.push(...batchProducts);
                              }
                              
                              productsData = [...productsData, ...additionalProducts];
                          }
                      }

                      // console.log(`ASIN counts - Initial: ${additionalAsins.size}, Final: ${productsData.length}`);
                      return productsData;
                  }
              }
          } catch {
              continue;
          }
      }
  }
  
  return null;
}
