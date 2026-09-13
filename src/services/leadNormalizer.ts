import type { Lead, LeadTier, LeadStatus } from '../types/lead';

// Helper to normalize header keys for matching
function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function findMatchingField(row: Record<string, any>, candidateKeys: string[]): any {
  const rowKeys = Object.keys(row);
  const normalizedCandidateKeys = candidateKeys.map(cleanKey);

  for (const rKey of rowKeys) {
    const cleanedRKey = cleanKey(rKey);
    if (normalizedCandidateKeys.includes(cleanedRKey)) {
      return row[rKey];
    }
  }

  // Substring match fallback for tricky nested or prefixed keys
  for (const rKey of rowKeys) {
    const cleanedRKey = cleanKey(rKey);
    for (const cand of normalizedCandidateKeys) {
      if (cleanedRKey.includes(cand) || cand.includes(cleanedRKey)) {
        return row[rKey];
      }
    }
  }

  return undefined;
}

export function normalizePhone(rawPhone: any): { phone: string; rawPhone: string } {
  if (rawPhone === null || rawPhone === undefined) {
    return { phone: '', rawPhone: '' };
  }
  const raw = String(rawPhone).trim();
  if (!raw) return { phone: '', rawPhone: '' };

  // Remove non-digit characters except +
  const digitsOnly = raw.replace(/\D/g, '');

  let normalized = raw;
  // Indian 10-digit mobile
  if (/^[6-9]\d{9}$/.test(digitsOnly)) {
    normalized = `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
  } else if (/^0[6-9]\d{9}$/.test(digitsOnly)) {
    const tenDigits = digitsOnly.slice(1);
    normalized = `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  } else if (/^91[6-9]\d{9}$/.test(digitsOnly)) {
    const tenDigits = digitsOnly.slice(2);
    normalized = `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }

  return { phone: normalized, rawPhone: raw };
}

export function normalizeTier(val: any): LeadTier | null {
  if (!val) return null;
  const s = String(val).trim().toUpperCase();
  if (s.startsWith('A')) return 'A';
  if (s.startsWith('B')) return 'B';
  if (s.startsWith('C')) return 'C';
  return null;
}

export function calculateLeadScore(data: {
  rating: number;
  reviews: number;
  images: number;
  hasPhone: boolean;
  googleRank?: number;
}): number {
  let score = 20; // Base presence score

  // Rating bonus
  if (data.rating >= 4.8) score += 25;
  else if (data.rating >= 4.5) score += 20;
  else if (data.rating >= 4.0) score += 15;
  else if (data.rating >= 3.5) score += 8;

  // Review count bonus
  if (data.reviews >= 100) score += 25;
  else if (data.reviews >= 50) score += 20;
  else if (data.reviews >= 25) score += 15;
  else if (data.reviews >= 10) score += 10;
  else if (data.reviews > 0) score += 5;

  // Images bonus
  if (data.images >= 50) score += 20;
  else if (data.images >= 20) score += 15;
  else if (data.images >= 5) score += 10;

  // Phone bonus
  if (data.hasPhone) score += 15;

  // Rank bonus if top 20
  if (data.googleRank && data.googleRank <= 20) {
    score += 5;
  }

  return Math.min(100, Math.max(10, score));
}

export function scoreToTier(score: number): LeadTier {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  return 'C';
}

export function generateSmartMessage(lead: {
  businessName: string;
  category?: string;
  rating?: number;
  reviews?: number;
  images?: number;
  city?: string;
}): string {
  const name = lead.businessName.trim();
  const category = (lead.category || 'interior design').toLowerCase();

  let introSocialProof = '';
  if (lead.rating && lead.reviews && lead.reviews > 5) {
    introSocialProof = ` and noticed you already have a strong presence there — ${lead.rating}★ with ${lead.reviews} reviews.`;
  } else if (lead.images && lead.images > 15) {
    introSocialProof = ` and noticed you have a strong portfolio of work showcased with ${lead.images} photos.`;
  } else {
    introSocialProof = ` and had a look at your ${category} work.`;
  }

  return `Hi! 👋\n\nI came across ${name} on Google${introSocialProof}\n\nI’m a freelance web developer, and I noticed you don’t currently have a dedicated website. For an interior-design business, a premium website can turn your project photos into a proper portfolio and make it easier for potential clients to understand your services and contact you directly on WhatsApp.\n\nI actually had an idea for a website concept for ${name}.\n\nWould you like me to send you a quick demo? 🙂`;
}

export function normalizeRawRow(
  row: Record<string, any>,
  importSource: string,
  rowIndex: number
): { lead: Lead | null; error?: string } {
  // 1. Business Name (mandatory)
  const rawName = findMatchingField(row, [
    'business name',
    'business_name',
    'name',
    'title',
    'company',
    'shop name',
  ]);

  const businessName = rawName ? String(rawName).trim() : '';
  if (!businessName) {
    return { lead: null, error: `Row ${rowIndex + 1}: Missing business name` };
  }

  // 2. Phone
  const rawPhoneVal = findMatchingField(row, [
    'phone',
    'phone number',
    'mobile',
    'contact',
    'tel',
    'phoneunformatted',
    'mobile number',
  ]);
  const { phone, rawPhone } = normalizePhone(rawPhoneVal);

  // 3. Category
  const rawCategory = findMatchingField(row, [
    'category',
    'categoryname',
    'categories/0',
    'type',
    'subtitle',
  ]);
  const category = rawCategory ? String(rawCategory).trim() : 'Interior Designer';

  // 4. Rating & Reviews
  const rawRating = findMatchingField(row, ['rating', 'totalscore', 'score', 'stars']);
  const parsedRating = parseFloat(rawRating);
  const rating = !isNaN(parsedRating) ? Math.min(5, Math.max(0, parsedRating)) : 0;

  const rawReviews = findMatchingField(row, [
    'reviews',
    'reviewscount',
    'reviews_count',
    'review count',
  ]);
  const parsedReviews = parseInt(rawReviews, 10);
  const reviews = !isNaN(parsedReviews) ? Math.max(0, parsedReviews) : 0;

  // 5. Images
  const rawImages = findMatchingField(row, [
    'google images',
    'imagescount',
    'images_count',
    'photos',
    'images',
  ]);
  const parsedImages = parseInt(rawImages, 10);
  const images = !isNaN(parsedImages) ? Math.max(0, parsedImages) : 0;

  // 6. City, Neighborhood, Address
  const rawCity = findMatchingField(row, ['city', 'location/city', 'town']);
  const city = rawCity ? String(rawCity).trim() : 'Bengaluru';

  const rawNeighborhood = findMatchingField(row, ['neighborhood', 'area', 'locality']);
  const neighborhood = rawNeighborhood ? String(rawNeighborhood).trim() : undefined;

  const rawAddress = findMatchingField(row, [
    'address',
    'formatted_address',
    'street',
    'full address',
  ]);
  const address = rawAddress ? String(rawAddress).trim() : undefined;

  // 7. Place ID & Maps URL
  const rawPlaceId = findMatchingField(row, ['placeid', 'place_id', 'place id']);
  const placeId = rawPlaceId ? String(rawPlaceId).trim() : undefined;

  const rawMapsUrl = findMatchingField(row, [
    'google maps url',
    'maps url',
    'url',
    'searchpageurl',
  ]);
  const googleMapsUrl = rawMapsUrl ? String(rawMapsUrl).trim() : undefined;

  // 8. Lead Score & Tier: PRESERVE IF PRESENT
  const rawScore = findMatchingField(row, ['lead score', 'lead_score']);
  const rawTier = findMatchingField(row, ['lead tier', 'lead_tier', 'tier']);

  let leadScore: number;
  const parsedScore = parseFloat(rawScore);
  if (!isNaN(parsedScore)) {
    leadScore = parsedScore;
  } else {
    // Rank bonus check
    const rawRank = findMatchingField(row, ['google rank', 'rank', 'priority rank']);
    const parsedRank = parseInt(rawRank, 10);
    leadScore = calculateLeadScore({
      rating,
      reviews,
      images,
      hasPhone: !!phone,
      googleRank: !isNaN(parsedRank) ? parsedRank : undefined,
    });
  }

  let leadTier: LeadTier;
  const normalizedTier = normalizeTier(rawTier);
  if (normalizedTier) {
    leadTier = normalizedTier;
  } else {
    leadTier = scoreToTier(leadScore);
  }

  // 9. Personalized Message: PRESERVE IF PRESENT
  const rawMsg = findMatchingField(row, [
    'personalized whatsapp message',
    'personalized message',
    'whatsapp message',
    'message',
  ]);
  const personalizedMessage =
    rawMsg && String(rawMsg).trim()
      ? String(rawMsg).trim()
      : generateSmartMessage({ businessName, category, rating, reviews, images, city });

  // 10. ID Generation
  const id =
    placeId ||
    `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${rowIndex}`;

  // 11. Notes, followUpDate, status
  const rawStatus = findMatchingField(row, ['status', 'contacted?']);
  let status: LeadStatus = 'New';
  if (rawStatus) {
    const s = String(rawStatus).trim().toLowerCase();
    if (s === 'contacted' || s === 'yes' || s === 'true') status = 'Contacted';
    else if (s === 'replied') status = 'Replied';
    else if (s === 'demo sent') status = 'Demo Sent';
    else if (s === 'interested') status = 'Interested';
    else if (s === 'won') status = 'Won';
    else if (s === 'lost') status = 'Lost';
    else if (s === 'not interested') status = 'Not Interested';
  }

  const lead: Lead = {
    id,
    placeId,
    businessName,
    phone,
    rawPhone,
    category,
    rating,
    reviews,
    images,
    city,
    neighborhood,
    address,
    leadScore,
    leadTier,
    personalizedMessage,
    website: findMatchingField(row, ['website', 'web', 'site', 'url', 'domain']) || undefined,
    googleMapsUrl,
    status,
    importSource,
    contactAttempts: status === 'Contacted' ? 1 : 0,
    notes: String(findMatchingField(row, ['notes', 'note', 'comment']) || ''),
    followUpDate: findMatchingField(row, ['follow-up date', 'followupdate', 'follow up date']) || undefined,
    quotedAmount: (() => {
      const v = findMatchingField(row, ['quoted amount', 'quoted', 'quote', 'quotedamount']);
      if (!v) return undefined;
      const num = parseFloat(String(v).replace(/[^0-9.]/g, ''));
      return !isNaN(num) ? num : undefined;
    })(),
    dealValue: (() => {
      const v = findMatchingField(row, ['deal value', 'deal', 'dealvalue', 'revenue', 'value']);
      if (!v) return undefined;
      const num = parseFloat(String(v).replace(/[^0-9.]/g, ''));
      return !isNaN(num) ? num : undefined;
    })(),
    currency: String(findMatchingField(row, ['currency']) || 'INR').trim().toUpperCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rawFields: { ...row }, // Never discard source data!
  };

  return { lead };
}
