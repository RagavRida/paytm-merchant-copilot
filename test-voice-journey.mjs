// Test script for end-to-end voice onboarding flow
import fetch from 'node-fetch';

async function runTest() {
  console.log('--- TEST 1: Greeting & Telugu input ---');
  let history = [];
  let profile = {
    businessName: '',
    businessCategory: '',
    location: '',
    city: '',
    pinCode: '',
    ownerName: '',
    contactNumber: '',
    productsServices: '',
    targetCustomers: '',
    paymentMethods: [],
    operatingHours: '',
    businessAddress: '',
    businessDescription: '',
  };

  const req1 = {
    message: "Naa shop Kukatpally lo undi. Men's clothing store naduputunnanu.",
    history: [],
    profile,
    stage: 'introduction',
    language: 'te-IN',
  };

  const res1 = await fetch('http://localhost:3000/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req1),
  }).then(r => r.json());

  console.log('AI Reply (Telugu):', res1.reply);
  console.log('Action:', res1.action);
  console.log('Extracted:', res1.extracted_fields);
  console.log('Next Stage:', res1.next_stage || res1.current_stage);

  // Merge fields
  Object.assign(profile, {
    businessCategory: res1.extracted_fields?.category || profile.businessCategory,
    location: res1.extracted_fields?.location || profile.location,
  });
  history.push({ role: 'user', content: req1.message });
  history.push({ role: 'assistant', content: res1.reply });

  console.log('\n--- TEST 2: Camera Capture Exterior ---');
  const req2 = {
    message: "[Photo captured: Shop Exterior] [Simulated analysis] Shop exterior photo captured. Visible signage 'Ravi Trends' identified. Storefront displays men's apparel.",
    history,
    profile,
    stage: 'shop_exterior',
    language: 'te-IN',
    cameraInteractions: [{ type: 'shop_exterior', analysisResult: "Signage 'Ravi Trends' identified" }],
  };

  const res2 = await fetch('http://localhost:3000/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req2),
  }).then(r => r.json());

  console.log('AI Reply:', res2.reply);
  console.log('Extracted:', res2.extracted_fields);
  console.log('Action:', res2.action);

  if (res2.extracted_fields?.business_name) profile.businessName = res2.extracted_fields.business_name;
  history.push({ role: 'user', content: req2.message });
  history.push({ role: 'assistant', content: res2.reply });

  console.log('\n--- TEST 3: Language Switch to English & Owner + Products ---');
  const req3 = {
    message: "Yes that's right. My name is Ravi Kumar. We sell shirts, trousers and T-shirts mainly to college students and office goers. Phone is 9876543210.",
    history,
    profile,
    stage: 'business_info',
    language: 'en-IN',
  };

  const res3 = await fetch('http://localhost:3000/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req3),
  }).then(r => r.json());

  console.log('AI Reply (English):', res3.reply);
  console.log('Extracted:', res3.extracted_fields);

  if (res3.extracted_fields?.owner_name) profile.ownerName = res3.extracted_fields.owner_name;
  if (res3.extracted_fields?.contact_number) profile.contactNumber = res3.extracted_fields.contact_number;
  if (res3.extracted_fields?.products_services) profile.productsServices = String(res3.extracted_fields.products_services);
  if (res3.extracted_fields?.target_customers) profile.targetCustomers = String(res3.extracted_fields.target_customers);
  history.push({ role: 'user', content: req3.message });
  history.push({ role: 'assistant', content: res3.reply });

  console.log('\n--- TEST 4: Voice Location Correction ---');
  const req4 = {
    message: "Actually, my shop is in Miyapur, not Kukatpally. Near Miyapur Metro Station.",
    history,
    profile,
    stage: 'business_info',
    language: 'en-IN',
  };

  const res4 = await fetch('http://localhost:3000/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req4),
  }).then(r => r.json());

  console.log('AI Reply (Correction):', res4.reply);
  console.log('Extracted:', res4.extracted_fields);
  if (res4.extracted_fields?.location) profile.location = res4.extracted_fields.location;

  console.log('\n--- TEST 5: TTS Audio Generation for Telugu & English ---');
  const ttsTe = await fetch('http://localhost:3000/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: "నమస్కారం! పేటీఎమ్‌కి స్వాగతం.", language: 'te-IN' }),
  }).then(r => r.json());
  console.log('Telugu TTS audio received, base64 length:', ttsTe.audio?.length || 0);

  const ttsEn = await fetch('http://localhost:3000/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: "Sure Ravi, I have updated your shop location to Miyapur.", language: 'en-IN' }),
  }).then(r => r.json());
  console.log('English TTS audio received, base64 length:', ttsEn.audio?.length || 0);

  console.log('\n--- FINAL MERCHANT PROFILE STATE ---');
  console.log(JSON.stringify(profile, null, 2));
}

runTest().catch(console.error);
