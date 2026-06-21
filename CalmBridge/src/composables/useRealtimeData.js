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

        socket.on(
            'telemetryUpdated',
            (data) => {
                console.log('realtime update', data)

                const existingIndex =
                    realtimeStudents.value.findIndex(
                        student =>
                            student.studentId === data.studentId
                    )

                const updatedStudent = {
                    studentId: data.studentId,
                    deviceId: data.braceletId,

                    heartRate: data.heartRate,
                    hrv: data.hrv,
                    gsr: data.gsr,

                    stressScore: data.stressScore,
                    stressLevel: data.stressLevel,

                    connected: true,
                }

                if (existingIndex !== -1) {
                    realtimeStudents.value[
                        existingIndex
                    ] = updatedStudent
                } else {
                    realtimeStudents.value.push(
                        updatedStudent
                    )
                }
            }
        )
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
                    data.braceletId
            );

       const updatedStudent = {
    studentId: data.studentId,

    deviceId: data.braceletId,

    heartRate: data.heartRate,

    hrv: data.hrv,

    gsr: data.gsr,

    stressScore: data.stressScore,

    stressLevel: data.stressLevel,

    connected: true,
}

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

        socket.off('telemetryUpdated');
    });

    return {

        latestData,

        bufferSize,

        stressData,

        realtimeStudents,
    };
}