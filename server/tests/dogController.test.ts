import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDogImage } from '../controllers/dogController';
import { getRandomDogImage } from '../services/dogService';

//Korvataan dogService mock-funktiolla.
vi.mock('../services/dogService', () => ({
  getRandomDogImage: vi.fn()
}));

describe('getDogImage', () => {
  //Testissä käytettävä valevastaus palvelulta.
  const mockDogData = {
    imageUrl: 'https://example.com/dog.jpg',
    status: 'success'
  };

  //Luodaan mockattu Express response -olio ennen jokaista testiä.
  let mockResponse: any;

  beforeEach(() => {
    //Tyhjennetään mockien kutsutiedot ennen testiä.
    vi.clearAllMocks();

    //json palauttaa response-olion, jotta metodikutsut voidaan ketjuttaa.
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    //Määritetään palvelun palauttama valevastaus.
    vi.mocked(getRandomDogImage).mockResolvedValue(mockDogData);
  });

  //Testi: Testataan onnistunutta kontrollerin suoritusta.
  it('should return success and dog image data', async () => {
    // Kutsutaan kontrolleria. Request-oliota ei tarvita tässä testissä.
    await getDogImage({} as any, mockResponse);

    //Tarkistetaan, että kontrolleri palauttaa oikean JSON-rakenteen.
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockDogData
    });

    //Tarkistetaan, että palvelufunktiota kutsuttiin.
    expect(getRandomDogImage).toHaveBeenCalledOnce();
  });
});