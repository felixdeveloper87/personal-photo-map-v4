import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

// Register English locale
countries.registerLocale(en);

export const fetchCountryData = async (countryId) => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryId}`);
    if (!response.ok) throw new Error('Primary API failed');
    const data = await response.json();
    const countryData = data[0];

    const nativeNameObj = countryData.name.nativeName;
    const firstLangKey = nativeNameObj ? Object.keys(nativeNameObj)[0] : null;
    const nativeName = firstLangKey ? nativeNameObj[firstLangKey].common : countryData.name.common;

    return {
      officialLanguage: Object.values(countryData.languages || {})[0] || 'N/A',
      currency: Object.keys(countryData.currencies || {})[0] || 'N/A',
      currencyName: countryData.currencies
        ? Object.values(countryData.currencies)[0].name
        : 'Unknown Currency',
      capital: countryData.capital ? countryData.capital[0] : 'N/A',
      population: countryData.population || 0,
      nativeName: nativeName,
    };
  } catch (error) {
    console.warn('RestCountries API failed. Trying GeoDB API...', error);
    try {
      const geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryId.toUpperCase()}`;
      const geoDbResponse = await fetch(geoDbUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'daf418934fmshf85c3a6a3375a4dp11c91ejsnd32ae998c868',
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
        },
      });
      if (!geoDbResponse.ok) throw new Error('GeoDB API also failed');
      const result = await geoDbResponse.json();
      const country = result.data;
      return {
        officialLanguage: 'N/A',
        currency: 'N/A',
        currencyName: 'Unknown Currency',
        capital: country.capital || 'N/A',
        population: country.population || 0,
        nativeName: countries.getName(countryId.toUpperCase(), 'en') || countryId.toUpperCase(),
      };
    } catch (fallbackError) {
      console.error('Both APIs failed:', fallbackError);
      throw new Error('Unable to fetch country data from any API');
    }
  }
};



export const fetchWeatherData = async (capital, countryCode) => {
  const query = `${capital},${countryCode}`;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=e95265ec87670e7e1d84bd49cff7e84c`
  );
  if (!response.ok) throw new Error('Weather data not found');
  const data = await response.json();
  return {
    temperature: data.main?.temp,
    timezone: data.timezone,
    description: data.weather?.[0]?.description,
    icon: data.weather?.[0]?.icon,
    coord: data.coord,
  };
};

export const fetchExchangeRate = async (currency) => {
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/c70ba82c951cf6c5b6757ff5/latest/GBP`
  );
  if (!response.ok) throw new Error('Exchange rate not found');
  const data = await response.json();
  const rate = data.conversion_rates?.[currency];
  return rate ? Number(rate).toFixed(2) : null;
};

export const fetchFactbookData = async (countryId) => {
  try {
    // Primeiro, tentar buscar dados reais de religião
    const religionData = await fetchReligionData(countryId);
    
    // Dados base do Factbook
    const factbookData = {
      government: 'Democratic Republic',
      economy: 'Mixed Economy',
      population: 'Varies by country',
      geography: 'Diverse landscapes',
      people: 'Multi-ethnic population',
      religion: religionData?.religion || 'N/A',
      culture: religionData?.culture || 'N/A',
      wikipediaSummary: religionData?.wikipediaSummary || null
    };
    
    return factbookData;
  } catch (error) {
    console.error('Error fetching Factbook data:', error);
    return {
      government: 'N/A',
      economy: 'N/A',
      population: 'N/A',
      geography: 'N/A',
      people: 'N/A',
      religion: 'N/A',
      culture: 'N/A',
      wikipediaSummary: null
    };
  }
};

// Função para buscar dados de religião da Wikipedia
export const fetchReligionData = async (countryId) => {
  try {
    // Buscar dados da Wikipedia
    const wikipediaData = await fetchWikipediaData(countryId);
    if (wikipediaData) {
      return {
        religion: wikipediaData.religion || 'N/A',
        culture: wikipediaData.culture || 'N/A',
        wikipediaSummary: wikipediaData.summary
      };
    }

    return {
      religion: 'N/A',
      culture: 'N/A',
      wikipediaSummary: null
    };
  } catch (error) {
    console.error('Error fetching religion data:', error);
    return {
      religion: 'N/A',
      culture: 'N/A',
      wikipediaSummary: null
    };
  }
};

// Função para buscar dados da Wikipedia
export const fetchWikipediaData = async (countryId) => {
  try {
    // Obter o nome do país para buscar na Wikipedia
    const countryName = countries.getName(countryId.toUpperCase(), 'en');
    if (!countryName) return null;

    // Buscar dados da Wikipedia usando a API pública
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Extrair informações relevantes
    const summary = data.extract || null;
    
    // Buscar dados específicos de religião e cultura
    const religionData = await extractReligionFromWikipedia(countryName);
    
    return {
      summary,
      religion: religionData.religion,
      culture: religionData.culture
    };
  } catch (error) {
    console.warn('Wikipedia API error:', error);
    return null;
  }
};

// Função para extrair dados de religião da Wikipedia
const extractReligionFromWikipedia = async (countryName) => {
  try {
    // Buscar na Wikipedia por informações específicas sobre religião
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName + " religion")}`;
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      const data = await response.json();
      // Tentar extrair informações de religião do resumo
      const summary = data.extract || '';
      
      // Padrões comuns para identificar religiões principais
      const religionPatterns = {
        'Christianity': /Christian|Catholic|Protestant|Orthodox/gi,
        'Islam': /Muslim|Islam|Islamic/gi,
        'Hinduism': /Hindu|Hinduism/gi,
        'Buddhism': /Buddhist|Buddhism/gi,
        'Judaism': /Jewish|Judaism/gi,
        'Atheism': /Atheist|Atheism|Non-religious/gi
      };
      
      let mainReligion = 'N/A';
      for (const [religion, pattern] of Object.entries(religionPatterns)) {
        if (pattern.test(summary)) {
          mainReligion = religion;
          break;
        }
      }
      
      return {
        religion: mainReligion,
        culture: 'Cultural heritage information available'
      };
    }
  } catch (error) {
    console.warn('Error extracting religion from Wikipedia:', error);
  }
  
  return {
    religion: 'N/A',
    culture: 'N/A'
  };
};
