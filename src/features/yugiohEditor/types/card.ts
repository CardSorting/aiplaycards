export interface YugiohCardData {
  // Basic card information
  uiLang: string;
  cardLang: string;
  holo: boolean;
  cardRare: string;
  titleColor: string;
  cardLoadYgoProEnabled: boolean;
  cardKey: string;
  cardTitle: string;
  cardImg: File | null;

  // Card type and subtype
  cardType: 'Monster' | 'Spell' | 'Trap';
  cardSubtype: string;
  cardEff1: string;
  cardEff2: string;

  // Monster-specific properties
  cardAttr: 'DIVINE' | 'EARTH' | 'WATER' | 'FIRE' | 'WIND' | 'LIGHT' | 'DARK';
  cardCustomRaceEnabled: boolean;
  cardCustomRace: string;
  cardRace: string;
  Pendulum: boolean;
  Special: boolean;
  cardLevel: string;

  // Pendulum properties
  cardBLUE: number;
  cardRED: number;
  pendulumSize: number;
  cardPendulumInfo: string;

  // Stats
  cardATK: string;
  cardDEF: string;

  // Link monster properties
  links: {
    [key: number]: {
      val: boolean;
      symbol: string;
    };
  };

  // Text properties
  infoSize: string;
  cardInfo: string;
}

export interface YugiohCardImages {
  template: HTMLImageElement;
  holo: HTMLImageElement;
  link1?: HTMLImageElement;
  link2?: HTMLImageElement;
  link3?: HTMLImageElement;
  link4?: HTMLImageElement;
  link6?: HTMLImageElement;
  link7?: HTMLImageElement;
  link8?: HTMLImageElement;
  link9?: HTMLImageElement;
  attr: HTMLImageElement;
  photo: HTMLImageElement;
  levelOrSubtype: HTMLImageElement;
}

export interface LanguageConfig {
  name: string;
  _templateLang: string;
  _fontName: string[];
  _offset: {
    tS: number;
    tX: number;
    tY: number;
    sS: number;
    sX1: number;
    sY1: number;
    sX2: number;
    sY2: number;
    oX: number;
    oY: number;
    lh: number;
  };
  Race: Record<string, string>;
  M_SPECIAL: string;
  Subtype: Record<string, string>;
  Effect: Record<string, string>;
  M_PENDULUM: string;
  M_EFFECT: string;
  QUOTE_L: string;
  QUOTE_R: string;
  Spell: string;
  Trap: string;
  SEP: string;
  Default: {
    title: string;
    info: string;
    size: string;
    pInfo: string;
    pSize: string;
  };
}

export interface UILanguage {
  name: string;
  ui_lang: string;
  card_lang: string;
  square_foil_stamp: string;
  on: string;
  off: string;
  rarity: string;
  title_color: string;
  card_secret: string;
  auto_fill_card_data: string;
  card_secret_note: string;
  plz_input_card_secret: string;
  card_name: string;
  upload_image: string;
  drag_and_drop: string;
  card_type: string;
  card_subtype: string;
  card_effect: string;
  card_attribute: string;
  card_race_type: string;
  custom: string;
  plz_input_race_type: string;
  pendulum: string;
  special_summon: string;
  lavel_and_rank: string;
  pendulum_area: string;
  pendulum_blue: string;
  pendulum_red: string;
  text_size: string;
  card_info_text: string;
  attack: string;
  defence: string;
  link: string;
  generate: string;
  download: string;
  auto_gen_note: string;
  reset_to_default: string;
  monster_card: string;
  spell_card: string;
  trap_card: string;
  m_card: {
    normal: string;
    effect: string;
    fusion: string;
    ritual: string;
    synchro: string;
    xyz: string;
    link: string;
    token: string;
    slifer: string;
    ra: string;
    obelisk: string;
    ldragon: string;
  };
  st_card: {
    normal: string;
    continuous: string;
    field: string;
    equip: string;
    quick: string;
    ritual: string;
    counter: string;
  };
  card_effect_opts: Record<string, string>;
  card_attr_opts: Record<string, string>;
  card_race_type_opts: Record<string, string>;
}
