import {
    ref,
    onMounted,
    onUnmounted
} from 'vue';

import {
    socket
} from '../services/socket.js';

export function useRealtimeData() {

    // Existing data
    const latestData = ref(null);

    const bufferSize = ref(0);

    const stressData = ref(null);

    // New realtime students data
    const realtimeStudents = ref([]);
    onMounted(() => {

        socket.on('connect', () => {

            console.log(
                'Connected to server'
            );
        });
        console.log('SOCKET EVENT RECEIVED');

        // Existing raw sensor stream
        socket.on(
            'newSensorData',
            (data) => {

                console.log(
                    'raw sensor update',
                    data
                );

                latestData.value =
                    data.latest;

                bufferSize.value =
                    data.bufferSize;
            }
        );

        // New ML realtime updates
        socket.on(
    'sensor-update',
    (data) => {

        console.log(
            'realtime update',
            data
        );

        const existingIndex =
            realtimeStudents.value.findIndex(

                student =>
                    student.deviceId ===
                    data.deviceId
            );

        const updatedStudent = {

            deviceId:
                data.deviceId,

            heartRate:
                Math.round(
                    data.heartRate
                ),

            stressLevel:
                data.stressLevel,

            connected:
                data.connected,
        };

        // Update existing student
        if (existingIndex !== -1) {

            realtimeStudents.value[
                existingIndex
            ] = updatedStudent;
        }

        // Add new student
        else {

            realtimeStudents.value.push(
                updatedStudent
            );
        }
    }
);
    });

    onUnmounted(() => {

        socket.off('connect');

        socket.off('newSensorData');

        socket.off('sensor-update');
    });

    return {

        latestData,

        bufferSize,

        stressData,

        realtimeStudents,
    };
}