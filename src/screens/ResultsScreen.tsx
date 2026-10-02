import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { api } from '../api/services';
import type { BusResult, FlightResult, HotelResult, SearchParams, SearchResult, TrainResult } from '../api/types';
import { Card, Chip, Empty, Loading, ModeIcon, Rating, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, modeColors, radius, space } from '../theme';
import { addDays, dayParts, daysBetween, formatDate, formatDuration, inr, nextDayOffset, timeBucket, today } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;
type Sort = 'recommended' | 'cheapest' | 'fastest' | 'earliest' | 'rating';

export default function ResultsScreen({ navigation, route }: Props) {
  const [search, setSearch] = useState<SearchParams>(route.params.search);
  const [data, setData] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<Sort>('recommended');
  const [filters, setFilters] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    navigation.setOptions({
      title: search.mode === 'hotel' ? `Hotels in ${search.city.name}` : `${search.from.name} → ${search.to.name}`,
    });
  }, [navigation, search]);

  const load = useCallback(async () => {
    setData(null);
    setError('');
    try {
      const s = search;
      const res =
        s.mode === 'hotel'
          ? await api.searchHotels(s)
          : s.mode === 'bus'
            ? await api.searchBuses(s)
            : s.mode === 'train'
              ? await api.searchTrains(s)
              : await api.searchFlights(s);
      setData(res);
    } catch (e: any) {
      setError(e.message);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (f: string) =>
    setFilters((p) => {
      const n = new Set(p);
      n.has(f) ? n.delete(f) : n.add(f);
      return n;
    });

  const filterOptions: string[] =
    search.mode === 'bus'
      ? ['AC', 'Non AC', 'Sleeper', 'Seater', 'Morning', 'Evening', 'Night']
      : search.mode === 'train'
        ? ['Available', '3A', '2A', 'SL', 'CC', 'Morning', 'Night']
        : search.mode === 'flight'
          ? ['Non-stop', '1 stop', 'Morning', 'Afternoon', 'Evening', 'Meal']
          : ['5 star', '4 star', '3 star', 'Pool', 'Free WiFi', 'Breakfast', 'Rating 4+'];

  const sortOptions: Sort[] =
    search.mode === 'hotel' ? ['recommended', 'cheapest', 'rating'] : ['recommended', 'cheapest', 'fastest', 'earliest'];

  const visible = useMemo(() => {
    if (!data) return [];
    let list = [...data];
    const has = (f: string) => filters.has(f);
    if (search.mode === 'bus') {
      const b = list as BusResult[];
      list = b.filter((x) => {
        const ac = x.busType.includes('A/C') && !x.busType.startsWith('Non');
        if (has('AC') && !has('Non AC') && !ac) return false;
        if (has('Non AC') && !has('AC') && ac) return false;
        if (has('Sleeper') && !x.busType.includes('Sleeper')) return false;
        if (has('Seater') && !x.busType.includes('Seater')) return false;
        const tb = ['Morning', 'Afternoon', 'Evening', 'Night'].filter(has);
        if (tb.length && !tb.includes(timeBucket(x.departure))) return false;
        return true;
      });
    } else if (search.mode === 'train') {
      list = (list as TrainResult[]).filter((x) => {
        const cls = ['3A', '2A', 'SL', 'CC'].filter(has);
        if (cls.length && !x.classes.some((c) => cls.includes(c.code))) return false;
        if (has('Available') && !x.classes.some((c) => c.available > 0)) return false;
        const tb = ['Morning', 'Night'].filter(has);
        if (tb.length && !tb.includes(timeBucket(x.departure))) return false;
        return true;
      });
    } else if (search.mode === 'flight') {
      list = (list as FlightResult[]).filter((x) => {
        if (has('Non-stop') && !has('1 stop') && x.stops !== 0) return false;
        if (has('1 stop') && !has('Non-stop') && x.stops !== 1) return false;
        if (has('Meal') && !x.fares.some((f) => f.meal)) return false;
        const tb = ['Morning', 'Afternoon', 'Evening'].filter(has);
        if (tb.length && !tb.includes(timeBucket(x.departure))) return false;
        return true;
      });
    } else {
      list = (list as HotelResult[]).filter((x) => {
        const stars = [5, 4, 3].filter((s) => has(`${s} star`));
        if (stars.length && !stars.includes(x.stars)) return false;
        if (has('Pool') && !x.amenities.includes('Pool')) return false;
        if (has('Free WiFi') && !x.amenities.includes('Free WiFi')) return false;
        if (has('Breakfast') && !x.amenities.includes('Breakfast')) return false;
        if (has('Rating 4+') && x.rating < 4) return false;
        return true;
      });
    }
    const price = (x: any): number =>
      search.mode === 'train' ? Math.min(...(x as TrainResult).classes.map((c) => c.price)) : search.mode === 'hotel' ? x.pricePerNight : x.price;
    if (sort === 'cheapest') list.sort((a, b) => price(a) - price(b));
    if (sort === 'fastest') list.sort((a: any, b: any) => a.durationMins - b.durationMins);
    if (sort === 'earliest') list.sort((a: any, b: any) => a.departure.localeCompare(b.departure));
    if (sort === 'rating') list.sort((a: any, b: any) => b.rating - a.rating);
    return list;
  }, [data, filters, sort, search.mode]);

  const open = (item: SearchResult) => {
    const s = search;
    if (s.mode === 'hotel') navigation.navigate('HotelDetail', { search: s, hotel: item as HotelResult });
    else if (s.mode === 'bus') navigation.navigate('BusSeats', { search: s, bus: item as BusResult });
    else if (s.mode === 'train') navigation.navigate('TrainDetail', { search: s, train: item as TrainResult });
    else navigation.navigate('FlightDetail', { search: s, flight: item as FlightResult });
  };

  const header = (
    <View style={{ backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingTop: space.md }}>
        <ModeIcon mode={search.mode} size={18} />
        <Text style={[font.small, { marginLeft: 6, flex: 1 }]} numberOfLines={1}>
          {search.mode === 'hotel'
            ? `${formatDate(search.checkIn, false)} – ${formatDate(search.checkOut, false)} · ${search.rooms} room · ${search.guests} guests`
            : `${formatDate(search.date)} · ${search.passengers} ${search.mode === 'bus' ? 'seat' : 'traveller'}${search.passengers > 1 ? 's' : ''}${search.cabin ? ' · ' + search.cabin : ''}`}
        </Text>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Modify</Text>
      </Pressable>

      {search.mode !== 'hotel' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
          {Array.from({ length: 10 }, (_, i) => addDays(search.date, i - 2))
            .filter((d) => d >= today())
            .map((d) => {
              const p = dayParts(d);
              const active = d === search.date;
              return (
                <Pressable
                  key={d}
                  onPress={() => setSearch({ ...search, date: d })}
                  style={{
                    width: 58,
                    alignItems: 'center',
                    paddingVertical: 6,
                    marginRight: 8,
                    borderRadius: radius.md,
                    backgroundColor: active ? colors.primary : colors.bg,
                  }}
                >
                  <Text style={{ fontSize: 11, color: active ? colors.white : colors.textMuted }}>{p.dow}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: active ? colors.white : colors.text }}>{p.day}</Text>
                  <Text style={{ fontSize: 11, color: active ? colors.white : colors.textMuted }}>{p.month}</Text>
                </Pressable>
              );
            })}
        </ScrollView>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingVertical: space.md }}>
        {sortOptions.map((s) => (
          <Chip key={s} icon={s === sort ? 'swap-vertical' : undefined} label={s[0].toUpperCase() + s.slice(1)} active={s === sort} onPress={() => setSort(s)} />
        ))}
        <View style={{ width: 1, backgroundColor: colors.border, marginRight: 8 }} />
        {filterOptions.map((f) => (
          <Chip key={f} label={f} active={filters.has(f)} onPress={() => toggle(f)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {header}
      {error ? (
        <Empty icon="cloud-offline-outline" title="Couldn't load results" message={error} action="Try again" onAction={load} />
      ) : !data ? (
        <Loading label={`Finding the best ${search.mode === 'hotel' ? 'stays' : 'options'}…`} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}
          ListHeaderComponent={
            <Text style={[font.small, { marginBottom: space.md }]}>
              {visible.length} of {data.length} {search.mode === 'hotel' ? 'properties' : search.mode === 'bus' ? 'buses' : search.mode + 's'}
            </Text>
          }
          ListEmptyComponent={
            data.length === 0 ? (
              <Empty title="Nothing found" message={search.mode === 'bus' ? 'No buses run on this route. Try a train or flight.' : 'No results for this search. Try another date.'} />
            ) : (
              <Empty icon="funnel-outline" title="No matches" message="No results match your filters." action="Clear filters" onAction={() => setFilters(new Set())} />
            )
          }
          renderItem={({ item }) => (
            <Card onPress={() => open(item)} style={{ marginBottom: space.md }}>
              {search.mode === 'bus' && <BusCard b={item as BusResult} />}
              {search.mode === 'train' && <TrainCard t={item as TrainResult} />}
              {search.mode === 'flight' && <FlightCard f={item as FlightResult} />}
              {search.mode === 'hotel' && <HotelCard h={item as HotelResult} nights={daysBetween(search.checkIn, search.checkOut)} />}
            </Card>
          )}
        />
      )}
    </View>
  );
}

function TimeLine({ dep, arr, duration, mid }: { dep: string; arr: string; duration: number; mid?: string }) {
  const plus = nextDayOffset(dep, duration);
  return (
    <Row style={{ marginTop: space.md }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{dep}</Text>
      <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 10 }}>
        <Text style={font.small}>{formatDuration(duration)}</Text>
        <View style={{ height: 1.5, backgroundColor: colors.border, alignSelf: 'stretch', marginVertical: 3 }} />
        {!!mid && <Text style={[font.small, { fontSize: 11 }]}>{mid}</Text>}
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
        {arr}
        {plus > 0 && <Text style={{ fontSize: 11, color: colors.danger }}> +{plus}</Text>}
      </Text>
    </Row>
  );
}

function BusCard({ b }: { b: BusResult }) {
  return (
    <>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={font.h3}>{b.operator}</Text>
          <Text style={font.small} numberOfLines={1}>
            {b.busType}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>from</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{inr(b.price)}</Text>
        </View>
      </Row>
      <TimeLine dep={b.departure} arr={b.arrival} duration={b.durationMins} />
      <Row style={{ marginTop: space.md, justifyContent: 'space-between' }}>
        <Row>
          <Rating value={b.rating} />
          <Text style={[font.small, { marginLeft: 8 }]}>{b.amenities.slice(0, 3).join(' · ')}</Text>
        </Row>
        <Text style={{ fontSize: 12, fontWeight: '700', color: b.seatsLeft < 8 ? colors.danger : colors.success }}>{b.seatsLeft} seats left</Text>
      </Row>
    </>
  );
}

function TrainCard({ t }: { t: TrainResult }) {
  return (
    <>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={font.h3} numberOfLines={1}>
            {t.name}
          </Text>
          <Text style={font.small}>
            #{t.number} · Runs {t.runsOn.length === 7 ? 'daily' : t.runsOn.join(' ')}
          </Text>
        </View>
      </Row>
      <TimeLine dep={t.departure} arr={t.arrival} duration={t.durationMins} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md }}>
        {t.classes.map((c) => {
          const avl = c.available > 0;
          const wl = c.availability.startsWith('WL');
          return (
            <View
              key={c.code}
              style={{
                minWidth: 92,
                padding: 8,
                marginRight: 8,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: avl ? colors.success + '55' : wl ? colors.danger + '44' : colors.warning + '66',
                backgroundColor: avl ? colors.successSoft : wl ? colors.dangerSoft : '#FFF8E1',
              }}
            >
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', color: colors.text }}>{c.code}</Text>
                <Text style={{ fontWeight: '700', fontSize: 12, color: colors.text }}>{inr(c.price)}</Text>
              </Row>
              <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 4, color: avl ? colors.success : wl ? colors.danger : '#B07C00' }}>{c.availability}</Text>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

function FlightCard({ f }: { f: FlightResult }) {
  return (
    <>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ flex: 1 }}>
          <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: modeColors.flight + '15', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ fontWeight: '900', color: modeColors.flight, fontSize: 12 }}>{f.airlineCode}</Text>
          </View>
          <View>
            <Text style={font.h3}>{f.airline}</Text>
            <Text style={font.small}>{f.flightNumber}</Text>
          </View>
        </Row>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{inr(f.price)}</Text>
      </Row>
      <TimeLine dep={f.departure} arr={f.arrival} duration={f.durationMins} mid={f.stops ? `1 stop · ${f.stopCity}` : 'Non-stop'} />
      {f.fares.some((x) => x.meal) && (
        <Row style={{ marginTop: space.sm }}>
          <Ionicons name="restaurant-outline" size={13} color={colors.textMuted} />
          <Text style={[font.small, { marginLeft: 4 }]}>Meal available on Flexi fares</Text>
        </Row>
      )}
    </>
  );
}

function HotelCard({ h, nights }: { h: HotelResult; nights: number }) {
  return (
    <View style={{ margin: -space.lg }}>
      <View
        style={{
          height: 120,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          backgroundColor: `hsl(${h.hue}, 55%, 42%)`,
          justifyContent: 'flex-end',
          padding: space.md,
        }}
      >
        <View style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <View style={{ position: 'absolute', right: 40, top: 30, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <Ionicons name="business" size={36} color="rgba(255,255,255,0.9)" />
      </View>
      <View style={{ padding: space.lg }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ color: colors.warning, fontSize: 12 }}>{'★'.repeat(h.stars)}</Text>
            <Text style={font.h3}>{h.name}</Text>
            <Row style={{ marginTop: 2 }}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={[font.small, { marginLeft: 2 }]}>{h.area}</Text>
            </Row>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{inr(h.pricePerNight)}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>per night</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{inr(h.pricePerNight * nights)} total</Text>
          </View>
        </Row>
        <Row style={{ marginTop: space.md }}>
          <Rating value={h.rating} />
          <Text style={[font.small, { marginLeft: 8 }]}>
            {h.reviews.toLocaleString('en-IN')} reviews · {h.amenities.slice(0, 3).join(' · ')}
          </Text>
        </Row>
      </View>
    </View>
  );
}
