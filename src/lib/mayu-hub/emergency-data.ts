/**
 * Emergency Services Data
 * صيدليات 24 ساعة، مستشفيات، مراكز طبية، طوارئ
 */

export interface EmergencyService {
  id: string
  nameAr: string
  type: 'pharmacy_24h' | 'hospital' | 'medical_center' | 'civil_registry' | 'police' | 'fire_station' | 'ambulance'
  phone: string
  address?: string
  neighborhoodId?: string
  isNational?: boolean // خدمات على مستوى الدولة (إسعاف، مطافي)
}

export const emergencyTypeLabels: Record<EmergencyService['type'], { label: string; icon: string; color: string }> = {
  pharmacy_24h: { label: 'صيدليات 24 ساعة', icon: '💊', color: 'bg-green-500' },
  hospital: { label: 'مستشفيات', icon: '🏥', color: 'bg-red-500' },
  medical_center: { label: 'مراكز طبية', icon: '🩺', color: 'bg-blue-500' },
  civil_registry: { label: 'السجل المدني', icon: '📋', color: 'bg-purple-500' },
  police: { label: 'الشرطة', icon: '🚔', color: 'bg-slate-700' },
  fire_station: { label: 'المطافي', icon: '🚒', color: 'bg-orange-500' },
  ambulance: { label: 'الإسعاف', icon: '🚑', color: 'bg-red-600' },
}

export const emergencyServices: EmergencyService[] = [
  // أرقام طوارئ وطنية
  { id: 'em-ambulance', nameAr: 'الإسعاف', type: 'ambulance', phone: '123', isNational: true },
  { id: 'em-police', nameAr: 'الشرطة', type: 'police', phone: '122', isNational: true },
  { id: 'em-fire', nameAr: 'المطافي', type: 'fire_station', phone: '180', isNational: true },

  // مستشفيات
  { id: 'em-hospital-1', nameAr: 'مستشفى 15 مايو العام', type: 'hospital', phone: '+20225559876', address: 'شارع المستشفى، المجاورة 2', neighborhoodId: 'neighborhood-2' },
  { id: 'em-hospital-2', nameAr: 'مستشفى التأمين الصحي', type: 'hospital', phone: '+20225558765', address: 'الشارع الرئيسي، المجاورة 5', neighborhoodId: 'neighborhood-5' },

  // مراكز طبية
  { id: 'em-medical-1', nameAr: 'مركز طبي الحياة', type: 'medical_center', phone: '+20225554444', address: 'المجاورة 1', neighborhoodId: 'neighborhood-1' },
  { id: 'em-medical-2', nameAr: 'مركز طبي الشفاء', type: 'medical_center', phone: '+20225553333', address: 'المجاورة 3', neighborhoodId: 'neighborhood-3' },

  // صيدليات 24 ساعة
  { id: 'em-pharmacy-1', nameAr: 'صيدلية الشفاء (24 ساعة)', type: 'pharmacy_24h', phone: '+201012345678', address: 'الشارع الرئيسي، المجاورة 1', neighborhoodId: 'neighborhood-1' },
  { id: 'em-pharmacy-2', nameAr: 'صيدلية الدواء (24 ساعة)', type: 'pharmacy_24h', phone: '+201098765432', address: 'شارع الصيدليات، المجاورة 4', neighborhoodId: 'neighborhood-4' },
  { id: 'em-pharmacy-3', nameAr: 'صيدلية النيل (24 ساعة)', type: 'pharmacy_24h', phone: '+201155566677', address: 'المجاورة 6', neighborhoodId: 'neighborhood-6' },

  // السجل المدني
  { id: 'em-civil-1', nameAr: 'السجل المدني - 15 مايو', type: 'civil_registry', phone: '+20225550001', address: 'المجاورة 3', neighborhoodId: 'neighborhood-3' },

  // قسم الشرطة
  { id: 'em-police-station', nameAr: 'قسم شرطة 15 مايو', type: 'police', phone: '+20225550000', address: 'الشارع الرئيسي، المجاورة 4', neighborhoodId: 'neighborhood-4' },
]
