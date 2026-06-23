import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';

interface Patin {
  talla: number;
  cantidad: number;
}

interface Persona {
  nombre: string;
  rut: string;
  tallaZapato: number | 'N/A';
  tipo: 'tutor' | 'acompañante';
}

interface Horario {
  horario: string;
  duracionMinutos: number;
  totalPersonas: number;
  personas: Persona[];
  resumenTallas: Patin[];
}

interface DaySummary {
  horarios: Horario[];
  resumenDelDia: {
    totalPersonasDia: number;
    resumenTallasGeneral: Patin[];
  };
}

const DashboardPage: React.FC = () => {
  const { api } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedDate) {
      fetchSummary(selectedDate);
    }
  }, [selectedDate]);

  const fetchSummary = async (date: Date) => {
    setLoading(true);
    setError('');
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const { data } = await api.get('/reservations/patines/day-summary', {
        params: { date: formattedDate },
      });
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch summary', err);
      setError('Failed to fetch data. Ensure the backend is running and accessible.');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!summary || !selectedDate) return;

    const wb = XLSX.utils.book_new();
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    // Sheet 1: General Summary
    const resumenData = [
      ['Fecha', formattedDate],
      ['Total Personas en el Día', summary.resumenDelDia.totalPersonasDia],
      [],
      ['Resumen General de Tallas'],
      ['Talla', 'Cantidad'],
      ...summary.resumenDelDia.resumenTallasGeneral.map(p => [p.talla, p.cantidad])
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen del Día');

    // Sheet 2: Detailed List per Schedule
    const allPersonas = summary.horarios.flatMap(h => 
      h.personas.map(p => ({
        Horario: h.horario,
        Nombre: p.nombre,
        RUT: p.rut,
        'Talla Zapato': p.tallaZapato,
        Tipo: p.tipo,
      }))
    );
    if(allPersonas.length > 0) {
      const wsPersonas = XLSX.utils.json_to_sheet(allPersonas);
      XLSX.utils.book_append_sheet(wb, wsPersonas, 'Listado de Personas');
    }

    XLSX.writeFile(wb, `Resumen_Patines_${formattedDate}.xlsx`);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Resumen Patinaje</Typography>
        <Button variant="contained" onClick={handleExport} disabled={!summary}>
          Exportar a Excel
        </Button>
      </Box>

      <DatePicker
        label="Seleccionar Fecha"
        value={selectedDate}
        onChange={(newValue) => setSelectedDate(newValue)}
      />

      {loading && <Typography sx={{ mt: 2 }}>Cargando...</Typography>}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      
      {summary && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Resumen del Día</Typography>
          <Grid container spacing={3}>
         <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="text.secondary">Total de Personas</Typography>
                <Typography variant="h3">{summary.resumenDelDia.totalPersonasDia}</Typography>
              </Paper>
            </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" color="text.secondary">Distribución de Tallas</Typography>
                {summary.resumenDelDia.resumenTallasGeneral.length > 0 ? (
                  summary.resumenDelDia.resumenTallasGeneral.map(p => (
                    <Typography key={p.talla}>{`Talla ${p.talla}: ${p.cantidad} pares`}</Typography>
                  ))
                ) : (
                  <Typography>No hay datos de tallas.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="h5" gutterBottom sx={{mt: 4}}>Detalle por Horario</Typography>
          {summary.horarios.map(h => (
            <Paper key={h.horario} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">{`Horario: ${h.horario}`}</Typography>
              <Typography>Total Personas: {h.totalPersonas}</Typography>
              <ul>
                {h.personas.map(p => (
                  <li key={p.rut}>{`${p.nombre} (${p.rut}) - Talla: ${p.tallaZapato}`}</li>
                ))}
              </ul>
            </Paper>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default DashboardPage;
