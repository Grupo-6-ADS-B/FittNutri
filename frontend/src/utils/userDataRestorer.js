import api from './api';

export const restoreUserDataFromBackend = async () => {
  try {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    if (!token || token.startsWith('eyJ')) {
      console.log('Token é do Google, usando dados salvos localmente');
      return false;
    }

    const { data } = await api.get('/users/me');
    
    if (data) {
      if (data.nome) {
        sessionStorage.setItem('nomeUsuario', data.nome);
        localStorage.setItem('nomeUsuario', data.nome);
      }
      
      if (data.foto) {
        sessionStorage.setItem('fotoUsuario', data.foto);
        localStorage.setItem('fotoUsuario', data.foto);
      }
      
      if (data.id) {
        sessionStorage.setItem('idUsuario', data.id);
        localStorage.setItem('idUsuario', data.id);
      }
      
      console.log('Dados do usuário restaurados com sucesso');
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Erro ao restaurar dados do usuário:', error.message);
    return false;
  }
};

export const enhanceGoogleUserData = async (decodedData) => {
  try {
    if (decodedData.picture) {
      const enhancedPhoto = `${decodedData.picture}?s=200`;
      decodedData.picture = enhancedPhoto;
    }
    return decodedData;
  } catch (error) {
    console.warn('Erro ao melhorar dados do Google:', error);
    return decodedData;
  }
};
