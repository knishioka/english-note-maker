/**
 * 年齢別の漢字レベル判定。
 *
 * 学習者は日本語の問題文（訳・場面説明）を読んでから英語を書く。
 * その日本語が読めなければ問題として成立しないため、対象年齢で習っていない
 * 漢字が混ざらないようにデータ側を統一する。
 *
 * KANJI_BY_GRADE は学年別漢字配当表（教育漢字）。KANJIDIC の学年情報をもとに
 * 作成し、2017年改訂で4年に加わった都道府県名の漢字も4年として扱っている。
 * 4〜6年の細かい配当は改訂前後で入れ替わりがあるため、厳密な学年判定ではなく
 * 「この年齢で読めるか」の目安として使う。
 */

export const KANJI_BY_GRADE = {
  1: '一七三上下中九二五人休先入八六円出力十千口右名四土夕大天女子字学小山川左年手文日早月木本村林校森正気水火犬玉王生田男町白百目石空立竹糸耳花草虫見貝赤足車金雨青音',
  2: '万丸交京今会体何作元兄光公内冬刀分切前北午半南原友古台合同回図国園地場声売夏外多夜太妹姉室家寺少岩工市帰広店弓引弟弱強当形後心思戸才教数新方明星春昼時晴曜書朝来東楽歌止歩母毎毛池汽活海点父牛理用画番直矢知社秋科答算米紙細組絵線羽考聞肉自船色茶行西親角言計記話語読谷買走近通週道遠里野長門間雪雲電頭顔風食首馬高魚鳥鳴麦黄黒',
  3: '丁世両主乗予事仕他代住使係倍全具写列助勉動勝化区医去反取受号向君味命和品員商問坂央始委守安定実客宮宿寒対局屋岸島州帳平幸度庫庭式役待急息悪悲想意感所打投拾持指放整旅族昔昭暑暗曲有服期板柱根植業様横橋次歯死氷決油波注泳洋流消深温港湖湯漢炭物球由申界畑病発登皮皿相県真着短研礼神祭福秒究章童笛第筆等箱級終緑練羊美習者育苦荷落葉薬血表詩調談豆負起路身転軽農返追送速進遊運部都配酒重鉄銀開院陽階集面題飲館駅鼻',
  4: '不争井付令以仲伝位低佐例便信倉候借停健側働億兆児共兵典冷初別利刷副功加努労勇包卒協単博印参史司各告周唱喜器囲固型城埼堂塩士変夫失奈好媛季孫完官害富察岐岡崎巣差希席帯底府康建径徒得徳必念愛成戦折挙改救敗散料旗昨景最望未末札材束松果栃栄案梅梨械極標機欠歴残殺毒氏民求沖治法泣浅浴清満滋漁潟灯無然焼照熊熱牧特産的省祝票種積競笑管節粉紀約結給続縄置群老胃脈腸臣航良芸芽英茨菜街衣要覚観訓試説課議象貨貯費賀賞軍輪辞辺連達選郡量録鏡関阜阪陸隊静順願類飛飯養香験鹿',
  5: '久仏仮件任似余価保修俵個備像再刊判制券則効務勢厚句可営因団圧在均基報境墓増夢妻婦容寄導居属布師常幹序弁張往復志応快性恩情態慣承技招授採接提損支政故敵断旧易暴条枝査格桜検構武比永河液混減測準演潔災燃版犯状独率現留略益眼破確示祖禁移程税築精素経統絶綿総編績織罪義耕職肥能興舌舎術衛製複規解設許証評講謝識護豊財貧責貸貿資賛質輸述迷退逆造過適酸鉱銅銭防限険際雑非預領額飼',
  6: '並乱乳亡仁供俳値傷優党冊処刻割創劇勤危卵厳収后否吸呼善困垂域奏奮姿存孝宅宇宗宙宝宣密寸専射将尊就尺届展層己巻幕干幼庁座延律従忘忠憲我批担拝拡捨探推揮操敬映晩暖暮朗机枚染株棒模権樹欲段沿泉洗派済源潮激灰熟片班異疑痛皇盛盟看砂磁私秘穀穴窓筋策簡糖系紅納純絹縦縮署翌聖肺背胸脳腹臓臨至若著蒸蔵蚕衆裁装裏補視覧討訪訳詞誌認誕誠誤論諸警貴賃遺郵郷針鋼閉閣降陛除障難革頂骨',
};

/**
 * 年齢グループごとに使ってよい漢字の上限学年。
 * 0 = 漢字を使わない（ひらがな・カタカナのみ）。
 *
 * 4-6歳（未就学〜小1）: まだ漢字を習っていないので漢字なし＋分かち書き。
 * 7-9歳（小1〜小4前半）: 小1・小2で習う漢字まで。
 * 10-12歳（小4〜小6）: 小1〜小4で習う漢字まで。
 */
export const AGE_KANJI_LIMIT = {
  '4-6': 0,
  '7-9': 2,
  '10-12': 4,
};

const KANJI_PATTERN = /[一-鿿]/;

const GRADE_OF_KANJI = new Map();
for (const [grade, chars] of Object.entries(KANJI_BY_GRADE)) {
  for (const char of chars) {
    GRADE_OF_KANJI.set(char, Number(grade));
  }
}

/** 教育漢字に含まれない漢字（中学以降で習う漢字）の扱い。 */
const BEYOND_ELEMENTARY = 99;

/**
 * その漢字を習う学年を返す。教育漢字以外は BEYOND_ELEMENTARY。
 * @param {string} char
 * @returns {number}
 */
export const getKanjiGrade = (char) => GRADE_OF_KANJI.get(char) ?? BEYOND_ELEMENTARY;

/**
 * テキストに含まれる漢字のうち、いちばん学年が上のものを返す。漢字がなければ 0。
 * @param {string} text
 * @returns {number}
 */
export const getMaxKanjiGrade = (text) => {
  let max = 0;
  for (const char of text || '') {
    if (!KANJI_PATTERN.test(char)) continue;
    max = Math.max(max, getKanjiGrade(char));
  }
  return max;
};

/**
 * 対象年齢には難しすぎる漢字を列挙する（問題なければ空配列）。
 * @param {string} text
 * @param {string} ageGroup
 * @returns {Array<{ char: string, grade: number }>}
 */
export const findTooHardKanji = (text, ageGroup) => {
  const limit = AGE_KANJI_LIMIT[ageGroup];
  if (limit === undefined) return [];
  const found = new Map();
  for (const char of text || '') {
    if (!KANJI_PATTERN.test(char)) continue;
    const grade = getKanjiGrade(char);
    if (grade > limit) found.set(char, grade);
  }
  return [...found].map(([char, grade]) => ({ char, grade }));
};

/**
 * 対象年齢の子どもが読める表記かどうか。
 * @param {string} text
 * @param {string} ageGroup
 * @returns {boolean}
 */
export const isReadableAtAge = (text, ageGroup) => findTooHardKanji(text, ageGroup).length === 0;
