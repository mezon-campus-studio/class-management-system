package com.classroomhub.domain.attendance;

import java.time.LocalTime;
import java.util.List;

/**
 * Vietnamese school period schedule. Periods 1–5 are morning, 6–10 are
 * afternoon. Times are in Asia/Ho_Chi_Minh local time and applied as the
 * server resolves "today" sessions.
 */
public final class PeriodTimes {

    public record Slot(int period, LocalTime start, LocalTime end) {}

    public static final List<Slot> SLOTS = List.of(
            new Slot(1,  LocalTime.of( 7,  0), LocalTime.of( 7, 45)),
            new Slot(2,  LocalTime.of( 7, 55), LocalTime.of( 8, 40)),
            new Slot(3,  LocalTime.of( 8, 50), LocalTime.of( 9, 35)),
            new Slot(4,  LocalTime.of( 9, 55), LocalTime.of(10, 40)),
            new Slot(5,  LocalTime.of(10, 50), LocalTime.of(11, 35)),
            new Slot(6,  LocalTime.of(13, 30), LocalTime.of(14, 15)),
            new Slot(7,  LocalTime.of(14, 25), LocalTime.of(15, 10)),
            new Slot(8,  LocalTime.of(15, 30), LocalTime.of(16, 15)),
            new Slot(9,  LocalTime.of(16, 25), LocalTime.of(17, 10)),
            new Slot(10, LocalTime.of(17, 20), LocalTime.of(18,  5))
    );

    public static Slot of(int period) {
        return SLOTS.stream().filter(s -> s.period() == period).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid period: " + period));
    }

    private PeriodTimes() {}
}
