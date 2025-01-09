import { Config } from "../types.ts";

export async function fetchMissingAsins({asins, config}: {asins: string[], config: Config}) {
    const rc = {
      obfuscatedMarketplaceId: config.obfuscatedMarketplaceId,
      obfuscatedMerchantId: config.obfuscatedMerchantId,
      language: "en-US",
      sessionId: config.sessionId,
      currency: "USD",
      almThresholdsMap: {},
      queryParameterMap: {},
      weblabMap: {
        "ADPT_SE_STORES_CX_SLIDER_THUMBNAILS_614390": "C",
        "SE_STORES_AX_CCAPI_MIGRATION_545698": "T1",
        "ADPT_SE_PREMIUM_BEAUTY_THEME_702020": "C",
        "STORES_JUVEC_RSAS_MIGRATION_TO_SGW_990022": "T2",
        "ADPT_SE_STORES_CX_ATC_AND_QL_ON_SEARCH_RESULTS_597002": "T1",
        "ADPT_SE_STORES_LIGHTNING_DEAL_ATC_1091731": "T1",
        "ADPT_BSX_LOYALTY_FOLLOW_NEW_FOLLOW_BUTTON_EXPERIMENT_647291": "C",
        "STORES_CX_LINKOUT_VALIDATION_502746": "T1",
        "STORES_POSTS_337508": "T1",
        "LIVE_VIDEO_MAX_AGE_940615": "T1",
        "STORES_386110": "C",
        "ADPT_SE_STORES_BTPBADGEANDCLIPPING_808127": "T1",
        "ADPT_SE_STORES_CX_OUT_OF_STOCK_FILTER_621421": "T1",
        "STORES_TEST_TRAFFIC_446265": "C",
        "ADPT_SE_STORES_GATING_PREMIUM_BEAUTY_LIVE_CHAT_KILL_SWITCH_1094714": "C",
        "STORES_JUVEC_RSAS_MIGRATION_TO_SGW_SEARCH_PAGE_1014242": "T2",
        "SE_STORES_PG_LBR_NODE_418262": "T1",
        "ADPT_SE_STORES_CX_SOCIAL_SHARE_ON_HEADER_844025": "T1",
        "ADPT_SE_STORES_CX_PRICE_DISCLAIMER_890047": "C",
        "ADPT_SE_STORES_CLEAN_UP_EXPERIMENTAL_VIDEOS_902186": "T1",
        "SE_STORES_CX_SHOW_OOS_PARENT_572684": "T1",
        "ADPT_SE_STORES_CX_DEAL_BANNER_UPDATER_820054": "T1",
        "CM_CR_OMNIBUS_426621": "T1",
        "ADPT_SE_STORES_PREMIUM_BEAUTY_LIVE_CHAT_CSA_MIGRATION_1084032": "T1",
        "F3_SB_BADGE_945791": "C",
        "STORE_CX_AWLS_623218": "T1",
        "STORE_CX_NODE_540986": "T1",
        "EVENT_MASTER_BADGING_232372": "C",
        "ADPT_SE_STORES_CX_SLIDER_MAGNIFIER_614391": "T1",
        "PE_PRICING_PDAY_EVENT_213702": "C",
        "ADPT_SE_STORES_CX_MOBILE_NAV_EXPERIMENT_1_635886": "T1",
        "SHOPBOP_FASHION_THEME_792179": "T1",
        "STORES_ANALYTICS_NEW_INGRESS_TYPE_517426": "C",
        "STORES_AUTHORSTORE_POSTS_941563": "C"
      },
      appendedParameters: {
        ingress: "0",
        visitId: config.visitId
      },
      isPreviewCampaign: false,
      deviceType: "desktop",
      deviceMode: "Desktop",
      appVersion: "",
      osName: "",
      pageSubType: "Author",
      previewWidgetGroup: null,
      slateToken: config.slateToken,
      freshCartCsrfToken: config.freshCartCsrfToken,
      painterContentId: "",
      internal: false,
      profile: false,
      mshop: false,
      debug: false,
      previewCampaignId: null,
      inBlacklist: false,
      customerId: "",
      amazonApiAjaxEndpoint: "data.amazon.com",
      amazonApiCsrfToken: config.amazonApiCsrfToken
    };
  
    const requestPayload = {
      requestContext: rc,
      widgetType: "ProductGrid",
      sectionType: "AuthorAllBooksProductGrid",
      productGridType: "ma",
      authorFilters: {
        format: ["allFormats"],
        language: ["All Languages"]
      },
      isManualGrid: true,
      content: {
        includeOutOfStock: true
      },
      includeOutOfStock: true,
      endpoint: "ajax-data",
      ASINList: asins
    };
  
    const data = {
      url: "https://www.amazon.com/juvec",
      body: JSON.stringify(requestPayload),
      zone: "arborhouse_unlocker",
      format: "raw",
      method: "POST",
      country: "US",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://www.amazon.com",
        "Referer": "https://www.amazon.com/juvec"
      }
    };
  
    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('BRIGHTDATA_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const responseData = await response.json();
    return responseData?.products || [];
  }