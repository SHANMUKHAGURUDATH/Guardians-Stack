import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HospitalLocation } from '../types';
import {
  AlertTriangle,
  MapPin,
  Phone,
  Navigation,
  HeartPulse,
  Shield,
  Compass,
  Search,
  ExternalLink,
  Bot,
  RefreshCw,
  Building2,
  CheckCircle2,
  Eye,
  Crosshair,
  Layers,
} from 'lucide-react';

export const EmergencySosView: React.FC = () => {
  const {
    familyMembers,
    policies,
    medicalRecords,
    navigate,
  } = useApp();

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationFreshness, setLocationFreshness] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'locating' | 'manual'
  >('prompt');
  const [manualQuery, setManualQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [hospitals, setHospitals] = useState<HospitalLocation[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalLocation | null>(null);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(14);

  // Request browser geolocation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      fetchHospitalsFallback();
      return;
    }

    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationFreshness(new Date().toLocaleTimeString());
        setLocationStatus('granted');
        fetchHospitals(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setLocationStatus('denied');
        fetchHospitalsFallback();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const fetchHospitals = async (lat?: number, lng?: number, query?: string) => {
    setIsLoadingHospitals(true);
    try {
      const resp = await fetch('/api/hospitals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, query }),
      });
      const data = await resp.json();
      if (data.results && data.results.length > 0) {
        setHospitals(data.results);
        setSelectedHospital(data.results[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const fetchHospitalsFallback = () => {
    fetchHospitals(undefined, undefined, manualQuery || 'emergency hospitals');
  };

  useEffect(() => {
    // Initial fetch of emergency hospitals
    fetchHospitalsFallback();
  }, []);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    if (city === 'All') {
      fetchHospitalsFallback();
    } else {
      setManualQuery(city);
      fetchHospitals(undefined, undefined, city);
    }
  };

  const healthPolicies = policies.filter((p) => p.category === 'health' || p.category === 'group');

  // Compute map query string for Google Maps iframe
  const mapSearchQuery = selectedHospital
    ? `${selectedHospital.name}, ${selectedHospital.address}`
    : coords
    ? `${coords.lat},${coords.lng}`
    : manualQuery
    ? `emergency hospital in ${manualQuery}`
    : 'emergency trauma hospitals';

  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapSearchQuery
  )}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 pb-12">
      {/* High-Contrast Emergency Alert Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-600 via-rose-700 to-red-900 text-white shadow-2xl space-y-4 border border-red-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-red-200">
                Guardian Stack Rapid Response Mode
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Emergency Readiness & Hospital Finder
              </h1>
            </div>
          </div>

          {/* Direct 112 Dial Button (India Emergency Helpline) */}
          <div className="flex items-center gap-3">
            <a
              href="tel:112"
              className="px-5 py-3 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-sm shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Phone className="w-5 h-5 fill-current" />
              <span>DIAL 112 (NATIONAL EMERGENCY)</span>
            </a>
          </div>
        </div>

        <p className="text-xs text-red-100 max-w-3xl leading-relaxed">
          Immediate access to your family's verified blood groups, critical drug allergies, cashless hospitalization health card numbers, and 24/7 nearby emergency trauma facilities with live Google Maps routing.
        </p>
      </div>

      {/* Geolocation & Nearby Hospitals Locator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-500" />
              <span>Real Google Maps Emergency Hospital Scanner</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified 24/7 trauma centers, direct ER contact numbers, and turn-by-turn navigation.
            </p>
          </div>

          {/* Location Request Action */}
          <div className="flex items-center gap-2">
            {locationStatus !== 'granted' ? (
              <button
                onClick={handleRequestLocation}
                disabled={locationStatus === 'locating'}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
              >
                <Crosshair className="w-4 h-4" />
                <span>{locationStatus === 'locating' ? 'Acquiring GPS...' : 'Scan Near My GPS'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>GPS Live ({coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}) • {locationFreshness}</span>
              </div>
            )}
          </div>
        </div>

        {/* City Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold px-1">Quick Metro Filter:</span>
            {['All', 'Delhi NCR', 'Bengaluru', 'Chennai', 'Mumbai', 'Hyderabad', 'Kolkata'].map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  selectedCity === city
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchHospitals(undefined, undefined, manualQuery)}
                placeholder="Search hospital or locality..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-teal-500"
              />
            </div>
            <button
              onClick={() => fetchHospitals(undefined, undefined, manualQuery)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Real Embedded Google Map Section */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative bg-slate-100 dark:bg-slate-950">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>
                {selectedHospital ? (
                  <>
                    Viewing: <span className="text-teal-300 font-bold">{selectedHospital.name}</span> ({selectedHospital.distanceKm} km away)
                  </>
                ) : (
                  <span>Live Google Maps Satellite & Street View</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={
                  selectedHospital
                    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        selectedHospital.name + ' ' + selectedHospital.address
                      )}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold"
              >
                <span>Open in Google Maps App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="relative w-full h-80 sm:h-96">
            <iframe
              title="Real Google Maps Emergency Scanner"
              src={embedMapUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Nearby Hospitals Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-500" />
              <span>Verified 24/7 Hospitals with Direct ER Helplines</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {hospitals.length} facilities verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map((hosp, idx) => {
              const isSelected = selectedHospital?.name === hosp.name;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 ring-2 ring-teal-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {hosp.name}
                          </h4>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white">
                              Active Pin
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{hosp.address}</span>
                        </p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-black bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        {hosp.distanceKm} km
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {hosp.type}
                      </span>
                      {hosp.hasCardiologyICU && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-500/20 text-[10px] font-bold">
                          24/7 Cardiac & Trauma ICU
                        </span>
                      )}
                    </div>

                    {/* Cashless TPA networks */}
                    <div className="mt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Cashless Pre-Auth:</span>{' '}
                      {hosp.tpaCashless.join(', ')}
                    </div>
                  </div>

                  {/* Actions: Direct Dial & Google Maps Navigation */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${hosp.emergencyHelpline}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        title="Call Emergency Hotline"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                        <span>ER Hotline ({hosp.emergencyHelpline})</span>
                      </a>

                      {hosp.phone && (
                        <a
                          href={`tel:${hosp.phone}`}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer"
                          title="Call Reception"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Desk</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedHospital(hosp)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-500" />
                        <span>Focus on Map</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          hosp.name + ' ' + hosp.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate &rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Family Medical Summaries for Attending Doctors */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-red-500" />
          <span>Family Critical Health Summaries (Blood Groups & Allergies)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {familyMembers.map((member) => {
            const memberAllergies = medicalRecords.filter(
              (m) => m.familyMemberId === member.id && m.recordType === 'allergy'
            );
            const memberMeds = medicalRecords.filter(
              (m) => m.familyMemberId === member.id && m.recordType === 'medication'
            );

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {member.fullName}
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                    {member.bloodGroup}
                  </span>
                </div>

                {/* Allergies Highlight */}
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                  <div className="font-bold text-red-600 dark:text-red-400 text-[10px] uppercase">
                    Documented Allergies:
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                    {memberAllergies.length > 0
                      ? memberAllergies.map((a) => a.title).join(', ')
                      : 'None documented (NKDA)'}
                  </div>
                </div>

                {/* Active Meds */}
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">
                    Current Medications:
                  </span>
                  <div className="mt-0.5 font-medium truncate">
                    {memberMeds.length > 0
                      ? memberMeds.map((m) => m.title).join(', ')
                      : 'None documented'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Emergency: {member.emergencyContact.phone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cashless Health Insurance Cards for Instant Hospital Admission */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-500" />
          <span>Cashless Hospitalization Insurance Cards & TPA Desk Helplines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {healthPolicies.map((pol) => (
            <div
              key={pol.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0A1A2F] text-white border border-slate-800 shadow-md space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    {pol.insurerName}
                  </span>
                  <h3 className="font-extrabold text-base text-white mt-0.5">
                    {pol.policyName}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cashless Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/10">
                <div>
                  <span className="text-slate-400 text-[10px]">Policy Number:</span>
                  <div className="font-mono font-bold text-white">{pol.policyNumber}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Sum Insured:</span>
                  <div className="font-bold text-teal-300">₹{pol.sumAssured.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">TPA Pre-Auth Desk:</span>
                  <div className="font-bold text-white">{pol.claimContact.cashlessTPA || pol.claimContact.helplinePhone}</div>
                </div>
                {pol.claimContact.helplinePhone && (
                  <a
                    href={`tel:${pol.claimContact.helplinePhone}`}
                    className="px-3 py-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                  >
                    Call TPA
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
