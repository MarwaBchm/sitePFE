import Papa from 'papaparse';
import { socket } from '../services/socket';

export function startSensorSimulation(csvFile) {
  Papa.parse(csvFile, {
    header: true,
    download: true,

    complete: (results) => {
      const rows = results.data;

      let index = 0;

      const interval = setInterval(() => {
        if (index >= rows.length) {
          clearInterval(interval);

          console.log('Simulation finished');

          return;
        }

        const row = rows[index];

        const payload = {
          timestamp: Number(row.timestamp),
          hr: Number(row.hr),
          hrv: Number(row.hrv),
          gsr: Number(row.gsr),
        };

        console.log('Sending:', payload);

        socket.emit('sensorData', payload);

        index++;
      }, 1000); // 1 row per second
    },
  });
}