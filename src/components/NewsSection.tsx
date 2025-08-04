import React, { useState, useEffect } from 'react';
import { getNews, Article } from '../services/newsService';
import { Globe, Filter } from 'lucide-react';

const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [filter, setFilter] = useState('forex');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const newsArticles = await getNews(filter);
      setArticles(newsArticles);
      setLoading(false);
    };

    fetchNews();
  }, [filter]);

  const handleTimeZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeZone(e.target.value);
  };

  const formatTime = (utcDate: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone,
      }).format(new Date(utcDate));
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Real-Time News</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg text-white text-sm p-1"
            >
              <option value="all">All News</option>
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="global">Global</option>
              <option value="economy">Economical</option>
              <option value="currency">Currency News</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <select
              value={timeZone}
              onChange={handleTimeZoneChange}
              className="bg-gray-700 border border-gray-600 rounded-lg text-white text-sm p-1"
            >
            {[
              "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Bamako",
              "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura",
              "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam",
              "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare",
              "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa",
              "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka",
              "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia",
              "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou",
              "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek",
              "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina",
              "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca", "America/Argentina/Cordoba",
              "America/Argentina/Jujuy", "America/Argentina/La_Rioja", "America/Argentina/Mendoza",
              "America/Argentina/Rio_Gallegos", "America/Argentina/Salta", "America/Argentina/San_Juan",
              "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia",
              "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Bahia", "America/Bahia_Banderas",
              "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista",
              "America/Bogota", "America/Boise", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun",
              "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago", "America/Chihuahua",
              "America/Costa_Rica", "America/Creston", "America/Cuiaba", "America/Curacao", "America/Danmarkshavn",
              "America/Dawson", "America/Dawson_Creek", "America/Denver", "America/Detroit", "America/Dominica",
              "America/Edmonton", "America/Eirunepe", "America/El_Salvador", "America/Fort_Nelson", "America/Fortaleza",
              "America/Glace_Bay", "America/Godthab", "America/Goose_Bay", "America/Grand_Turk", "America/Grenada",
              "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax",
              "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis", "America/Indiana/Knox",
              "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City",
              "America/Indiana/Vevay", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Inuvik",
              "America/Iqaluit", "America/Jamaica", "America/Juneau", "America/Kentucky/Louisville",
              "America/Kentucky/Monticello", "America/Kralendijk", "America/La_Paz", "America/Lima",
              "America/Los_Angeles", "America/Lower_Princes", "America/Maceio", "America/Managua", "America/Manaus",
              "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Menominee",
              "America/Merida", "America/Metlakatla", "America/Mexico_City", "America/Miquelon", "America/Moncton",
              "America/Monterrey", "America/Montevideo", "America/Montserrat", "America/Nassau", "America/New_York",
              "America/Nipigon", "America/Nome", "America/Noronha", "America/North_Dakota/Beulah",
              "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Ojinaga", "America/Panama",
              "America/Pangnirtung", "America/Paramaribo", "America/Phoenix", "America/Port-au-Prince",
              "America/Port_of_Spain", "America/Porto_Velho", "America/Puerto_Rico", "America/Punta_Arenas",
              "America/Rainy_River", "America/Rankin_Inlet", "America/Recife", "America/Regina", "America/Resolute",
              "America/Rio_Branco", "America/Santarem", "America/Santiago", "America/Santo_Domingo",
              "America/Sao_Paulo", "America/Scoresbysund", "America/Sitka", "America/St_Barthelemy",
              "America/St_Johns", "America/St_Kitts", "America/St_Lucia", "America/St_Thomas", "America/St_Vincent",
              "America/Swift_Current", "America/Tegucigalpa", "America/Thule", "America/Thunder_Bay",
              "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver", "America/Whitehorse",
              "America/Winnipeg", "America/Yakutat", "America/Yellowknife",
              "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie",
              "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera",
              "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok",
              "Arctic/Longyearbyen",
              "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe",
              "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok",
              "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Chita", "Asia/Choibalsan",
              "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe",
              "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd",
              "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka",
              "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata", "Asia/Krasnoyarsk",
              "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar",
              "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk",
              "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar",
              "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul",
              "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent",
              "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar",
              "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk",
              "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan",
              "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faroe",
              "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/St_Helena",
              "Atlantic/Stanley",
              "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Currie",
              "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman", "Australia/Lord_Howe",
              "Australia/Melbourne", "Australia/Perth", "Australia/Sydney",
              "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens", "Europe/Belgrade",
              "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest",
              "Europe/Busingen", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar",
              "Europe/Guernsey", "Europe/Helsinki", "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey",
              "Europe/Kaliningrad", "Europe/Kiev", "Europe/Kirov", "Europe/Lisbon", "Europe/Ljubljana",
              "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn",
              "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica",
              "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/San_Marino", "Europe/Sarajevo",
              "Europe/Saratov", "Europe/Simferopol", "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm",
              "Europe/Tallinn", "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Uzhgorod", "Europe/Vaduz",
              "Europe/Vatican", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw",
              "Europe/Zagreb", "Europe/Zaporozhye", "Europe/Zurich",
              "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro",
              "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte",
              "Indian/Reunion",
              "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham", "Pacific/Chuuk",
              "Pacific/Easter", "Pacific/Efate", "Pacific/Enderbury", "Pacific/Fakaofo", "Pacific/Fiji",
              "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam",
              "Pacific/Honolulu", "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro",
              "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk",
              "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei",
              "Pacific/Port_Moresby", "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa",
              "Pacific/Tongatapu", "Pacific/Wake", "Pacific/Wallis",
              "UTC"
            ].map((tz) => (
              <option key={tz} value={tz}>
                {`(GMT ${new Date().toLocaleTimeString('en-US', { timeZone: tz, timeZoneName: 'short' }).split(' ')[2]}) ${tz}`}
              </option>
            ))}
            </select>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-400">Loading news...</div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {articles.map((article, index) => (
            <div key={index} className="border-b border-gray-700 pb-4">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                <h4 className="font-semibold text-white">{article.title}</h4>
              </a>
              <p className="text-sm text-gray-400">{article.description}</p>
              <div className="text-xs text-gray-500 mt-2">
                <span>{article.source.name}</span> | <span>{formatTime(article.publishedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsSection;
