import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { apiErrorMessage } from '../api/axiosInstance.js';
import { genreApi } from '../api/genreApi.js';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { GenreForm } from '../components/genres/GenreForm.jsx';

export function EditGenrePage() {
  const { id } = useParams();
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    genreApi
      .get(id)
      .then((response) => {
        if (!ignore) setGenre(response.data.data);
      })
      .catch((error) => toast.error(apiErrorMessage(error)))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <Loader label="Loading genre" />;
  if (!genre) return <EmptyState title="Genre not found" message="The selected genre could not be loaded." />;

  return <GenreForm mode="edit" initialGenre={genre} />;
}
