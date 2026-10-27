import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import dogRoutes from '../routes/dogRoutes';
import { getDogImage } from '../controllers/dogController';

//Mockataan kontrolleri.
vi.mock('../controllers/dogController', () => ({
  getDogImage: vi.fn()
}));

describe('dogRoutes', () => {
  //Luodaan Express-sovellus testaamista varten.
  const app = express();

  //Liitetään reititin samaan polkuun.
  app.use('/api/dogs', dogRoutes);

  beforeEach(() => {
    //Tyhjennetään mockien kutsuhistoria ennen jokaista testiä.
    vi.clearAllMocks();
  });

  //Testi 4: Testataan onnistunutta GET-pyyntöä.
  it('should return status 200 and dog image data', async () => {
    // Mock-kontrolleri palauttaa onnistuneen JSON-vastauksen.
    vi.mocked(getDogImage).mockImplementation(async (_req, res) => {
      res.json({
        success: true,
        data: {
          imageUrl: 'https://example.com/dog.jpg',
          status: 'success'
        }
      });
    });

    //Käynnistetään sovellus väliaikaisesti satunnaiseen porttiin.
    const server = app.listen(0);

    try {
      //Selvitetään, mihin porttiin palvelin käynnistyi.
      const address = server.address();

      if (!address || typeof address === 'string') {
        throw new Error('Could not determine server port');
      }

      //Lähetetään HTTP-pyyntö Node.js:n omalla fetch-funktiolla.
      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/dogs/random`
      );

      //Luetaan vastauksen JSON-data.
      const body = await response.json();

      //Tarkistetaan statuskoodi, success-arvo ja kuvan URL.
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.imageUrl).toContain('https://example.com/dog.jpg');
    } finally {
      // Suljetaan palvelin myös silloin, jos testi epäonnistuu.
      server.close();
    }
  });

  //Testi 5: Testataan palvelinvirhettä.
  it('should return status 500 and an error message', async () => {
    //Mock-kontrolleri palauttaa virhevastauksen.
    vi.mocked(getDogImage).mockImplementation(async (_req, res) => {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dog image: Network error'
      });
    });

    const server = app.listen(0);

    try {
      const address = server.address();

      if (!address || typeof address === 'string') {
        throw new Error('Could not determine server port');
      }

      //Lähetetään pyyntö olemassa olevalle reitille.
      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/dogs/random`
      );

      const body = await response.json();

      //Tarkistetaan palvelinvirhe ja palautettu virheilmoitus.
      expect(response.status).toBe(500);
      expect(body.error).toBe(
        'Failed to fetch dog image: Network error'
      );
    } finally {
      server.close();
    }
  });
});