/**
 * Test Email Tracking
 * 
 * This script helps debug why tracking isn't working.
 * Run this in your browser console on the deployed app.
 */

async function testEmailTracking() {
  console.log('🔍 Starting Email Tracking Test...\n');
  
  // 1. Check if user is logged in
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('❌ User not logged in! Please login first.');
    return;
  }
  console.log('✅ User logged in:', user.uid);
  
  // 2. Check if we're in production
  const isProd = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;
  console.log(`✅ Environment: ${isProd ? 'Production' : isDev ? 'Development' : 'Unknown'}`);
  
  // 3. Test tracking URL generation
  const trackingHelpers = await import('./src/utils/trackingHelpers.js');
  const testCampaignId = 'test-campaign-123';
  const testRecipientId = 'test-recipient-456';
  
  const pixelUrl = trackingHelpers.getTrackingPixelUrl(testCampaignId, testRecipientId, user.uid);
  const clickUrl = trackingHelpers.getClickTrackingUrl('https://example.com', testCampaignId, testRecipientId, user.uid);
  
  console.log('\n📧 Generated Tracking URLs:');
  console.log('Open pixel:', pixelUrl);
  console.log('Click URL:', clickUrl);
  
  // 4. Test if pixel loads
  console.log('\n🔄 Testing if pixel loads...');
  const img = new Image();
  img.onload = () => console.log('✅ Pixel loaded successfully!');
  img.onerror = () => console.error('❌ Pixel failed to load!');
  img.src = pixelUrl;
  
  // 5. Check campaign stats
  console.log('\n📊 Checking campaign stats...');
  const db = (await import('./src/db/database.js')).db;
  const campaigns = await db.campaigns.toArray();
  
  if (campaigns.length === 0) {
    console.log('⚠️ No campaigns found');
  } else {
    console.log(`✅ Found ${campaigns.length} campaigns:`);
    campaigns.forEach(c => {
      console.log(`  - ${c.name}: sent=${c.stats?.sent || 0}, opened=${c.stats?.opened || 0}, clicked=${c.stats?.clicked || 0}`);
    });
  }
  
  // 6. Check tracking events
  console.log('\n📈 Checking tracking events...');
  const events = await db.trackingEvents.toArray();
  console.log(`✅ Found ${events.length} tracking events`);
  if (events.length > 0) {
    console.log('Recent events:', events.slice(-5));
  }
  
  // 7. Check if sync function exists
  const campaignStore = (await import('./src/store/campaignStore.db.js')).useCampaignStore;
  const store = campaignStore.getState();
  if (store.syncAllCampaignStats) {
    console.log('\n🔄 Syncing campaign stats...');
    await store.syncAllCampaignStats();
    console.log('✅ Stats synced!');
  } else {
    console.log('⚠️ syncAllCampaignStats not found');
  }
  
  console.log('\n✅ Test complete! Check logs above for issues.');
}

// Run the test
testEmailTracking().catch(err => console.error('❌ Test failed:', err));
