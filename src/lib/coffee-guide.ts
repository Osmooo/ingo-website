/**
 * Long descriptions and suggested brew recipes for each bean coffee.
 * The short description stays in products.ts (cards, meta description); this file holds the full
 * product story and the recipes shown on the product page, written as real text so search engines
 * and AI assistants can read it.
 *
 * Recipes are suggested starting points (general specialty-coffee ratios), not lab-tested INGO
 * recipes. Adjust the grind first if the cup tastes sour (grind finer) or bitter (grind coarser).
 */
import type { Text } from "./products";

export type RecipeKind = "hot" | "iced" | "espresso";

export interface Recipe {
  kind: RecipeKind;
  /** water temperature, °C */
  temp: number;
  /** ground coffee, grams */
  dose: number;
  /** hot water (ml) for filter, drink weight in the cup (g) for espresso */
  water: number;
  /** ice in the jug, grams (iced filter only) */
  ice?: number;
  /** total brew time, "m:ss" for filter, seconds range for espresso */
  time: string;
  grind: Text;
  /** pour schedule for filter: when to pour and the total water on the scale after that pour */
  pours?: { at: string; total: number }[];
  tip: Text;
}

export interface CoffeeGuide {
  story: { ar: string[]; en: string[] };
  recipes: Recipe[];
}

const GRIND = {
  hot: { ar: "وسط إلى ناعم قليلاً، مثل حبات الرمل", en: "Medium-fine, like sand" },
  iced: { ar: "أنعم قليلاً من الحار", en: "A little finer than for hot" },
  espresso: { ar: "ناعم، أنعم من السكر الناعم بقليل", en: "Fine, a little finer than caster sugar" },
} satisfies Record<RecipeKind, Text>;

const hot = (temp: number, tip: Text): Recipe => ({
  kind: "hot", temp, dose: 20, water: 300, time: "2:45", grind: GRIND.hot, tip,
  pours: [{ at: "0:00", total: 40 }, { at: "0:40", total: 120 }, { at: "1:10", total: 200 }, { at: "1:40", total: 300 }],
});
const iced = (temp: number, tip: Text): Recipe => ({
  kind: "iced", temp, dose: 20, water: 200, ice: 100, time: "2:15", grind: GRIND.iced, tip,
  pours: [{ at: "0:00", total: 40 }, { at: "0:40", total: 120 }, { at: "1:10", total: 200 }],
});
const espresso = (temp: number, out: number, time: string, tip: Text): Recipe => ({
  kind: "espresso", temp, dose: 18, water: out, time, grind: GRIND.espresso, tip,
});

export const GUIDES: Record<string, CoffeeGuide> = {
  "bella-guji": {
    story: {
      ar: [
        "بيلا قوجي قهوة إثيوبية من منطقة قوجي في جنوب البلاد. إثيوبيا هي الموطن الأصلي للبن العربي، وقوجي من مناطقها المرتفعة المعروفة بقهوة حلوة ونكهة واضحة.",
        "الحبوب من سلالات إثيوبية محلية (هيرلوم) ومجففة بالطريقة الطبيعية: تُقطف ثمرة البن ناضجة وتُنشر كاملة تحت الشمس أسابيع قبل نزع القشرة. خلال هذا الوقت تأخذ الحبة من سكر الثمرة، فيطلع الطعم أحلى وأكثر فاكهية من القهوة المغسولة.",
        "في الكوب تلاحظ الكرز والخوخ مع لمسة زهرية، بقوام متوسط. حمّصناها تحميصاً فاتحاً إلى متوسط (3 من 7 على الكيس) حتى تبقى نكهات الفاكهة واضحة.",
        "أحلى ما تكون في التقطير، حاراً أو بارداً، وتنفع إسبريسو لمن يحب كوباً فاكهياً فيه حموضة لطيفة. إذا تحب القهوة الفاكهية والعطرية، ابدأ بها.",
      ],
      en: [
        "Bella Guji is an Ethiopian coffee from the Guji zone in the south of the country. Ethiopia is the birthplace of Arabica coffee, and Guji is one of its highland regions known for sweet, clearly flavoured coffee.",
        "The beans are local Ethiopian heirloom varieties, processed natural: the ripe cherries are picked and dried whole in the sun for weeks before the fruit is removed. The bean takes on sugar from the fruit while it dries, so the cup is sweeter and fruitier than a washed coffee.",
        "In the cup you get berries and peach with a floral touch and a medium body. We roast it light to medium (3 of 7 on the bag) so the fruit stays clear.",
        "It shines as filter, hot or iced, and works as espresso if you like a fruity shot with gentle acidity. If you like fruity, aromatic coffee, start here.",
      ],
    },
    recipes: [
      hot(94, { ar: "قهوة فاتحة التحميص: الماء الأسخن قليلاً يطلّع حلاوة الفاكهة.", en: "A lighter roast: slightly hotter water brings out the fruit." }),
      iced(94, { ar: "نكهة الكرز والخوخ تطلع أوضح وهي باردة. حرّك الإبريق جيداً قبل الصب حتى يذوب الثلج.", en: "The berry and peach notes come through even more when cold. Swirl the jug well so the ice melts before serving." }),
      espresso(93, 40, "27–30", { ar: "نسبة أطول قليلاً (18 جم إلى 40 جم) تعطي شوت متوازن لقهوة فاتحة.", en: "A slightly longer ratio (18g to 40g) keeps a lighter roast balanced." }),
    ],
  },
  "santa-ana": {
    story: {
      ar: [
        "سانتا آنا قهوة من السلفادور في أمريكا الوسطى، وتحمل اسم منطقة سانتا آنا وبركانها. التربة البركانية والمرتفعات هناك من أسباب شهرة قهوة السلفادور.",
        "الحبوب مغسولة ومن مزيج سلالات: تُنزع الثمرة عن الحبة بعد القطف، ثم تُغسل الحبة وتُجفف. هذه الطريقة تعطي كوباً نظيفاً وواضحاً يُظهر طعم الحبة نفسها.",
        "طعمها شوكولاتة وكرز أحمر وبندق، بقوام متوسط وتوازن بين الحلاوة والحموضة. تحميصها متوسط (4 من 7 على الكيس).",
        "قهوة سهلة تعجب أغلب الناس: تنفع للتقطير اليومي، وتطلع إسبريسو متوازناً يمشي مع الحليب. إذا تبحث عن قهوة يومية لا تخيب، هذه هي.",
      ],
      en: [
        "Santa Ana is a coffee from El Salvador in Central America, named after the Santa Ana region and its volcano. The volcanic soil and high ground there are a big part of why Salvadoran coffee is well known.",
        "The beans are washed and a mix of varieties: the fruit is removed after picking, then the beans are washed and dried. This gives a clean, clear cup that shows the taste of the bean itself.",
        "It tastes of chocolate, red berry and hazelnut, with a medium body and a balance of sweetness and acidity. Medium roast (4 of 7 on the bag).",
        "An easy coffee most people enjoy: good for everyday filter and a balanced espresso that goes well with milk. If you want an everyday coffee that never lets you down, this is it.",
      ],
    },
    recipes: [
      hot(92, { ar: "إذا طلع الكوب حامضاً، نعّم الطحنة درجة واحدة.", en: "If the cup tastes sour, grind one step finer." }),
      iced(93, { ar: "الشوكولاتة والبندق تعطي كوباً بارداً ناعماً، وحلو مع قطعة تمر.", en: "Chocolate and hazelnut make a smooth iced cup. Nice with a date on the side." }),
      espresso(93, 36, "26–30", { ar: "نسبة 1 إلى 2 الكلاسيكية. تمشي ممتاز مع الحليب في الفلات وايت.", en: "The classic 1:2 ratio. Great with milk in a flat white." }),
    ],
  },
  "black-mountain": {
    story: {
      ar: [
        "الجبل الأسود قهوة برازيلية من منطقة موجيانا، على المرتفعات بين ولايتي ساو باولو وميناس جيرايس. البرازيل أكبر منتج للقهوة في العالم، وموجيانا من مناطقها المعروفة بقهوة حلوة قليلة الحموضة.",
        "الحبوب مجففة بالطريقة الطبيعية: تجف ثمرة البن كاملة تحت الشمس قبل نزع القشرة، فتزيد الحلاوة ويثقل القوام.",
        "طعمها مكسرات وشوكولاتة داكنة وبندق، بقوام غني وحموضة خفيفة. تحميصها متوسط (4 من 7 على الكيس).",
        "قهوة قوية ومريحة: تطلع إسبريسو غنياً يمشي مع الحليب في اللاتيه والكابتشينو، وتنفع للتقطير لمن يحب كوباً ثقيلاً قليل الحموضة.",
      ],
      en: [
        "Black Mountain is a Brazilian coffee from the Mogiana region, on the high ground between the states of São Paulo and Minas Gerais. Brazil is the world's largest coffee producer, and Mogiana is one of its regions known for sweet, low-acidity coffee.",
        "The beans are processed natural: the whole cherry dries in the sun before the fruit is removed, which adds sweetness and body.",
        "It tastes of nuts, dark chocolate and hazelnut, with a rich body and low acidity. Medium roast (4 of 7 on the bag).",
        "A strong, comforting coffee: a rich espresso that goes well with milk in a latte or cappuccino, and a filter for anyone who likes a heavy cup with little acidity.",
      ],
    },
    recipes: [
      hot(91, { ar: "قهوة غنية: الماء الأبرد قليلاً يحافظ على الحلاوة ويقلل المرارة.", en: "A rich coffee: slightly cooler water keeps it sweet and less bitter." }),
      iced(92, { ar: "تطلع باردة مثل الشوكولاتة الداكنة. جرّبها مع رشة حليب.", en: "Iced, it tastes like dark chocolate. Try it with a splash of milk." }),
      espresso(92, 36, "25–28", { ar: "أقوى ما تكون مع الحليب: لاتيه أو كابتشينو أو كورتادو.", en: "At its best with milk: latte, cappuccino or cortado." }),
    ],
  },
};
