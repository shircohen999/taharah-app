// ═══════════════════════════════════════════════════════
// GLOSSARY — brief halachic term definitions
// ═══════════════════════════════════════════════════════

const GLOSSARY_SECTIONS = [
  {
    labelKey: 'glossaryCycle',
    terms: [
      {
        id: 'veset',
        phase: 'veset',
        title: 'תחילת ווסת',
        titleEn: 'Period Start',
        he: 'יום הופעת הדם. כל חישובי הטהרה — הפסק, ספירה, טבילה ועונות פרישה — נמנים ממנו.',
        en: 'The day bleeding begins. All tahara calculations — hefsek, counting, immersion and separation — start from this day.',
      },
      {
        id: 'dam',
        phase: 'dam',
        title: 'ימי ראייה',
        titleEn: 'Period Days',
        he: 'ימי הדם עצמם. ספירת ז׳ הנקיים תתאפשר רק לאחר שהראייה הסתיימת לחלוטין.',
        en: 'The actual days of bleeding. The 7 clean-day count can only begin once bleeding has fully stopped.',
      },
      {
        id: 'hpst',
        phase: 'hpst',
        title: 'הפסק טהרה',
        titleEn: 'Hefsek Tahara',
        he: 'בדיקה פנימית בעד לבן הנעשית סמוך לשקיעה, ביום הראשון ללא ראייה (מינימום יום 5). מסיימת רשמית את ימי הטומאה.',
        en: 'An internal examination with a white cloth done near sunset on the first fully clean day (minimum day 5). Officially ends the days of impurity.',
      },
      {
        id: 'sefirah',
        phase: 'sefirah',
        title: '7 נקיים',
        titleEn: '7 Clean Days',
        he: 'שבעה ימים רצופים ונקיים לאחר ההפסק טהרה. בכל יום מבוצעת בדיקה לאימות הניקיון.',
        en: '7 consecutive clean days following the hefsek tahara. A bedika examination is performed each day.',
      },
      {
        id: 'bedika',
        phase: 'sefirah',
        title: 'בדיקה',
        titleEn: 'Bedika',
        he: 'בדיקה פנימית בעד לבן המאמתת ניקיון. מינימום ביום א׳ וביום ז׳ מהספירה (לפי מנהגים — בכל יום).',
        en: 'An internal examination with a white cloth confirming cleanliness. Required minimally on days 1 and 7 of counting (by some customs, daily).',
      },
      {
        id: 'tvila',
        phase: 'tvila',
        title: 'ליל הטבילה',
        titleEn: 'Mikveh Night',
        he: 'בליל היום השמיני (אחר צאת הכוכבים) טובלת האישה במקווה כשר וחוזרת להיות טהורה לבעלה.',
        en: 'On the night of the 8th day (after nightfall), the woman immerses in a kosher mikveh and returns to her husband as tehora.',
      },
      {
        id: 'tahora',
        phase: 'tahora',
        title: 'תקופת טהרה',
        titleEn: 'Tahora Period',
        he: 'הימים שלאחר הטבילה ועד הווסת הבא. האישה טהורה לבעלה ואין הגבלות מיוחדות.',
        en: 'The days following immersion until the next period. The woman is tehora to her husband with no special restrictions.',
      },
    ],
  },
  {
    labelKey: 'glossaryPrisha',
    terms: [
      {
        id: 'prisha',
        phase: 'prisha',
        title: 'עונת פרישה',
        titleEn: 'Onah (Prisha)',
        he: 'עונה שבה הבעל פורש מאשתו כאמצעי זהירות לפני וסת צפוי. חלה בשלוש עונות שונות.',
        en: 'A period in which the husband separates from his wife as a precaution before an expected period. Applies on three different occasions.',
      },
      {
        id: 'beinonit',
        phase: 'prisha',
        title: 'עונה בינונית',
        titleEn: 'Average Onah',
        he: 'פרישה ביום ה-30 מתחילת הווסת הנוכחי — בין ביום ובין בלילה לפי עונת הווסת.',
        en: 'Separation on the 30th day from the current period — matching the day/night of the original veset.',
      },
      {
        id: 'haflagah',
        phase: 'prisha',
        title: 'הפלגה',
        titleEn: 'Interval Onah',
        he: 'פרישה לאחר מספר ימים השווה בדיוק למרווח שבין שני הווסתות הקודמים.',
        en: 'Separation after the same interval of days as elapsed between the two previous periods.',
      },
      {
        id: 'chodesh',
        phase: 'prisha',
        title: 'עונת החודש',
        titleEn: 'Monthly Onah',
        he: 'פרישה בתאריך העברי הזהה בחודש הבא — לדוגמה, אם הווסת היה בי״ד אדר, הפרישה בי״ד ניסן.',
        en: 'Separation on the same Hebrew calendar date the following month — e.g. if the period was on 14 Adar, separation is on 14 Nisan.',
      },
    ],
  },
  {
    labelKey: 'glossaryFertility',
    terms: [
      {
        id: 'fertile',
        phase: 'fertile',
        title: 'חלון פוריות',
        titleEn: 'Fertile Window',
        he: 'הימים שסביב הביוץ המשוער שבהם הסיכוי להריון גבוה יחסית. מסומן בלוח לצורך מידע בלבד.',
        en: 'The days around estimated ovulation when the chance of conception is relatively high. Shown on the calendar for informational purposes only.',
      },
      {
        id: 'ovulation',
        phase: 'fertile',
        title: 'ביוץ משוער',
        titleEn: 'Estimated Ovulation',
        he: 'שחרור הביצית, לרוב כ-14 יום לפני הווסת הצפוי. האפליקציה מחשבת אותו לפי ממוצע המחזורים.',
        en: 'Release of the egg, typically ~14 days before the next expected period. The app calculates this based on your cycle average.',
      },
    ],
  },
  {
    labelKey: 'glossaryGeneral',
    terms: [
      {
        id: 'minhag',
        phase: null,
        title: 'מנהג הלכתי',
        titleEn: 'Halachic Practice',
        he: 'שיטת הפסיקה ההלכתית (אשכנז, ספרד, עדות המזרח, תימן) — משפיעה בעיקר על חישוב עונת הטבילה (לילה או יום).',
        en: 'The halachic tradition followed (Ashkenaz, Sepharad, Mizrahi, Yemenite) — mainly affects whether immersion is at night or the following day.',
      },
    ],
  },
  {
    labelKey: 'glossaryEvents',
    terms: [
      {
        id: 'kesem',
        phase: 'veset',
        title: 'כתם',
        titleEn: 'Stain (Kesem)',
        he: 'כתם דם שנמצא על הגוף או הבגד, ללא הרגשה גופנית מקדימה. עשוי לחייב ספירת שבעה נקיים בהתאם לגודלו ומיקומו — יש לשאול רב או יועצת הלכה מוסמכת.',
        en: 'A blood stain found on the body or garment without a preceding bodily sensation. May require seven clean days depending on size and location — consult a rabbi or a certified halachic advisor.',
      },
      {
        id: 'bedika_lo_nekia',
        phase: 'veset',
        title: 'בדיקה לא נקיה',
        titleEn: 'Unclean Bedika',
        he: 'בדיקה פנימית שנמצאו בה כתמים אדומים או צהובים. מחייבת חזרה על ספירת הנקיים מהיום הבא, לאחר הפסק טהרה מחודש.',
        en: 'An internal examination that revealed red or yellow staining. Requires restarting the clean-day count from the next day, with a new hefsek tahara if needed.',
      },
      {
        id: 'herayon',
        phase: 'herayon',
        title: 'הריון',
        titleEn: 'Pregnancy',
        he: 'אישה בהריון שאינה רואה דם — טהורה לבעלה. תיוג ההריון בלוח עוזר לעקוב אחר הפסקת המחזור עד ללידה.',
        en: 'A pregnant woman who is not bleeding is tehora to her husband. Logging the pregnancy helps track the pause in cycles until childbirth.',
      },
      {
        id: 'lida',
        phase: 'lida',
        title: 'לידה',
        titleEn: 'Childbirth',
        he: 'לידה מפסיקה את מצב הטהרה ומחייבת טבילה. הדינים מורכבים (תלויים בגדר לידת בן או בת ובמהלך הלידה) — יש לפנות לרב או יועצת הלכה מוסמכת.',
        en: 'Childbirth interrupts the state of tahara and requires immersion. The laws are complex (depending on the sex of the child and circumstances) — consult a rabbi or a certified halachic advisor.',
      },
      {
        id: 'hapala',
        phase: 'hapala',
        title: 'הפלה',
        titleEn: 'Miscarriage',
        he: 'הפלה עשויה לשאת דין לידה מבחינה הלכתית ולחייב טבילה. הדינים תלויים בשלב ההריון ובמהלך ההפלה — יש לפנות לרב או יועצת הלכה מוסמכת.',
        en: 'A miscarriage may carry halachic birth status and require immersion. The laws depend on the pregnancy stage and how it occurred — consult a rabbi or a certified halachic advisor.',
      },
      {
        id: 'bedika_rofea',
        phase: 'rofea',
        title: 'בדיקת רופא/ה',
        titleEn: 'Medical Exam',
        he: 'בדיקה גינקולוגית עשויה לגרום לדימום ולחייב שאלת רב או יועצת הלכה מוסמכת בנוגע למצב הטהרה. מומלץ להתייעץ עם רב או יועצת הלכה מוסמכת לפני הבדיקה ואחריה.',
        en: 'A gynecological exam may cause bleeding and require a ruling from a rabbi or a certified halachic advisor on tahara status. Consulting a rabbi or halachic advisor before and after the exam is recommended.',
      },
      {
        id: 'sheilat_rav',
        phase: 'sheilat',
        title: 'שאלת רב / יועצת הלכה',
        titleEn: 'Rabbi / Halachic Advisor Question',
        he: 'תיוג שאלה הלכתית שנשאלה לרב או יועצת הלכה מוסמכת — לרוב בנוגע לכתם, בדיקה לא נקיה, או ספק בדם. ניתן לתעד את התשובה (טהורה / טמאה) לצורך מעקב.',
        en: 'A logged halachic question posed to a rabbi or a certified halachic advisor — typically about a stain, an unclear bedika, or a questionable discharge. The ruling (pure/impure) can be recorded for tracking.',
      },
    ],
  },
];

function GlossaryScreen({lang}) {
  const isHe = lang !== 'en';
  return (
    <div>
      {GLOSSARY_SECTIONS.map(sec => (
        <div key={sec.labelKey}>
          <div className="sec-label">{t(sec.labelKey)}</div>
          <div className="card">
            {sec.terms.map((term, idx) => (
              <div key={term.id} style={{
                padding:'14px 18px',
                borderBottom: idx < sec.terms.length - 1 ? '0.5px solid var(--border)' : 'none',
                display:'flex', alignItems:'flex-start', gap:12,
              }}>
                <div style={{
                  width:9, height:9, borderRadius:'50%', flexShrink:0, marginTop:6,
                  background: term.phase ? `var(--phase-${term.phase})` : 'var(--border-mid)',
                }}/>
                <div>
                  <div style={{fontWeight:600, fontSize:14, marginBottom:4, color:'var(--text)'}}>{isHe ? term.title : (term.titleEn || term.title)}</div>
                  <div style={{fontSize:12.5, color:'var(--muted)', lineHeight:1.7}}>
                    {isHe ? term.he : term.en}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{padding:'12px 4px 4px', fontSize:11, color:'var(--muted)', lineHeight:1.8}}>
        {isHe
          ? '⚠️ המידע הוא לעזר בלבד. בכל שאלה הלכתית — יש לפנות לרב או יועצת הלכה מוסמכת.'
          : '⚠️ This content is for reference only. For any halachic question, consult a rabbi or a certified halachic advisor.'}
      </div>
    </div>
  );
}
