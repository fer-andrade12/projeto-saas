import React, { useState, useEffect } from 'react';
import api from '../api/api';

interface Campaign {
  id: number;
  name: string;
  description: string;
  type: string;
  active: boolean;
}

const CampaignsSimple: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('CampaignsSimple - useEffect executado');
    let isMounted = true;

    const loadData = async () => {
      console.log('CampaignsSimple - Iniciando loadData');
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/admin/campaigns?page=1&limit=10');
        console.log('CampaignsSimple - Resposta recebida:', response.data);
        
        if (isMounted) {
          setCampaigns(response.data || []);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('CampaignsSimple - Erro:', err);
        if (isMounted) {
          setError(err.message || 'Erro ao carregar campanhas');
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      console.log('CampaignsSimple - Cleanup executado');
      isMounted = false;
    };
  }, []); // Sem dependências - executa apenas uma vez

  console.log('CampaignsSimple - Render:', { isLoading, campaigns: campaigns.length, error });

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Carregando...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Erro: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Campanhas (Versão Simples)</h1>
      <p>Total: {campaigns.length} campanhas</p>
      
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <strong>{campaign.name}</strong> - {campaign.type} - 
            {campaign.active ? 'Ativa' : 'Inativa'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignsSimple;
