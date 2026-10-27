import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRandomDogImage } from '../services/dogService';

//describe ryhmittelee samaan aiheeseen liittyvät testit.
describe('getRandomDogImage', () => {

  //beforeEach suoritetaan ennen jokaista testiä.
  //Korvaamme fetch-funktion mock-funktiolla, jotta testissä
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  // afterEach palauttaa testissä muutetut globaalit arvot ennalleen.
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // TESTI 1: Testataan onnistunutta API-kutsua.
  it('should return a dog image when API call succeeds', async () => {

    // Valevastaus jäljittelee Dog API:n palauttamaa JSON-dataa.
    const mockData = {
      message: 'https://example.com/dog.jpg',
      status: 'success'
    };

    // Luodaan mockattu fetch-funktio.
    // ok: true tarkoittaa, että HTTP-pyyntö onnistui.
    // status: 200 tarkoittaa onnistunutta HTTP-vastausta.
    // json() palauttaa yllä määritellyn valevastauksen.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockData)
    });

    // Korvataan globaali fetch omalla mock-funktiolla.
    vi.stubGlobal('fetch', fetchMock);

    // Kutsutaan testattavaa palvelufunktiota.
    const result = await getRandomDogImage();

    // Tarkistetaan, että palautettu kuvan URL vastaa valevastauksen message-arvoa.
    expect(result.imageUrl).toBe(mockData.message);

    // Tarkistetaan, että palvelun palauttama tila on success.
    expect(result.status).toBe('success');

    // Tarkistetaan, että fetch-funktiota kutsuttiin täsmälleen kerran.
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  //Testi 2: Testataan API-kutsun epäonnistumista.
  it('should throw an error when API returns status 500', async () => {

    //Luodaan mockattu API-vastaus, jossa pyyntö epäonnistuu.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    //Korvataan globaali fetch mock-funktiolla.
    vi.stubGlobal('fetch', fetchMock);

    //Tarkistetaan, että palvelufunktio hylkää kutsun
    //heittää toteutuksen mukaisen virheilmoituksen.
    await expect(getRandomDogImage()).rejects.toThrow(
      'Failed to fetch dog image: Dog API returned status 500'
    );
  });
});