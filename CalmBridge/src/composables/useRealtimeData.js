import { ref, onMounted, onUnmounted } from 'vue';
import { socket } from '../services/socket.js';   

export function useRealtimeData() {
    const latestData = ref(null);
    const bufferSize = ref(0);
    const stressData = ref(null);
    

    onMounted(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('sensor-update', (data) =>{
            console.log('realtime update', data);
            latestData.value = data.latest;
            bufferSize.value = data.bufferSize;
        });
    });

    onUnmounted(() => {
        socket.off('connect');
        socket.off('sensor-update');
    });

    return {
        latestData,
        bufferSize
    };
}