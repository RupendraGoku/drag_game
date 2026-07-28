import { useEffect, useState } from 'react';
import { genreApi } from '../api/genreApi.js';
import { apiErrorMessage } from '../api/axiosInstance.js';

export const useGenre = (slug) => {
  const [genre, setGenre] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [genreResponse, relatedResponse] = await Promise.all([
        genreApi.getBySlug(slug),
        genreApi.related(slug).catch(() => ({ data: { data: [] } }))
      ]);
      setGenre(genreResponse.data.data);
      setRelated(relatedResponse.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  return { genre, related, loading, error, retry: load };
};
