export interface Car {
  id: string;
  name: string;
  kind: string;
  price: number; // VND
  hp: number;
  accel: number; // 0–100 km/h, giây
  vmax: number; // km/h
  image: string;
  blurb: string;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const CARS: Car[] = [
  {
    id: 'gt-aeon',
    name: 'GT ÆON',
    kind: 'Grand Tourer · Flagship',
    price: 12_800_000_000,
    hp: 640,
    accel: 3.1,
    vmax: 330,
    image: img('photo-1503376780353-7e6692767b70'),
    blurb: 'Kiệt tác đường dài — 12 xi-lanh, nội thất da Nappa khâu tay 214 giờ.',
  },
  {
    id: 'vanta-gt',
    name: 'VANTA GT',
    kind: 'Midnight Edition · Hypercar',
    price: 14_200_000_000,
    hp: 700,
    accel: 2.9,
    vmax: 340,
    image: img('photo-1552519507-da3b142c6e3d'),
    blurb: 'Ánh đen tuyệt đối. Chỉ 9 chiếc cho toàn Đông Nam Á, mỗi chiếc khắc số riêng.',
  },
  {
    id: 'sovereign-s',
    name: 'SOVEREIGN S',
    kind: 'Luxury Sedan',
    price: 9_600_000_000,
    hp: 560,
    accel: 3.6,
    vmax: 305,
    image: img('photo-1555215695-3004980ad54e'),
    blurb: 'Phòng khách bay ở 305 km/h — kính hai lớp, âm thanh 26 loa, sàn gỗ óc chó.',
  },
  {
    id: 'eclat-roadster',
    name: 'ÉCLAT ROADSTER',
    kind: 'Open Top',
    price: 11_500_000_000,
    hp: 585,
    accel: 3.4,
    vmax: 315,
    image: img('photo-1544636331-e26879cd4d9b'),
    blurb: 'Mui vải mở trong 11 giây, Để gió biển Đông thổi qua táp-lô da khác nhau.',
  },
  {
    id: 'aurelia-suv',
    name: 'AURELIA SUV',
    kind: 'Luxury Utility',
    price: 8_900_000_000,
    hp: 540,
    accel: 4.0,
    vmax: 290,
    image: img('photo-1519245659620-e859806a8d3b'),
    blurb: '540 mã lực trên mọi địa hình, ghế sau ngả 42°, tủ lạnh champagne tích hợp.',
  },
  {
    id: 'noir-coupe',
    name: 'NOIR COUPÉ',
    kind: 'Grand Tourer · Entry',
    price: 7_800_000_000,
    hp: 510,
    accel: 3.9,
    vmax: 285,
    image: img('photo-1493238792000-8113da705763'),
    blurb: 'Cửa ngõ vào thế giới AURUM — cân bằng hoàn hảo giữa sự hung hãn và nét lịch lãm.',
  },
];

export const FLAGSHIP = CARS[0];

export const formatVnd = (n: number) =>
  `${new Intl.NumberFormat('vi-VN').format(n)} ₫`;

export const formatShort = (n: number) =>
  `${(n / 1_000_000_000).toFixed(1).replace('.', ',')} TỶ`;
