export async function getAuthorPage(url: string) {
    // Strip everything after '?' from the URL
    const cleanUrl = url.split('?')[0];
    
    const data = {
      zone: "arborhouse_unlocker",
      url: cleanUrl,
      format: "raw",
      method: "GET",
      country: "US"
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
  
    return await response.text();
  }