import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import styles from './Info.module.css'

export default function Info() {
  return (
    <PageTransition>
      <div className={styles.page}>
        {/* Hero logo */}
        <Reveal>
          <div className={styles.hero}>
            <img src="/images/logo.png" alt="limbow" className={styles.heroImg} />
          </div>
        </Reveal>

        {/* Panels */}
        <div className={styles.panels}>
          <Reveal delay={0.1}>
            <div className={styles.panel}>
              <span className={styles.label}>About</span>
              <p className={styles.text}>
                Jag är en dynamisk figur, jag har spelat trumset för ABBA och är ofta
                sedd att jobba som en tolk för 37 språk. Jag skriver romaner på mina
                lunchraster och har skrivit 9/10 böcker som finns på listan "10 böcker
                som har förändrat mitt liv". Ibland optimerar jag processen av
                jordgubbssyltens produktion.
              </p>
              <p className={styles.text}>
                Jag charmar kvinnor med mina svenska uppsatser, gör standup comedy på
                fredagar och bakar mitt bröd själv. Om jag känner för det så kan jag
                springa 7 Iron Man på 6 dagar. Jag tycker om regnbågen, även om jag är
                färgblind. Jag lär små barn att simma.
              </p>
              <p className={styles.text}>
                Jag behärskar pianot, men behöver bara endast 1 av de 88 tangenterna.
                Jag har aldrig gråtit hos läkaren. Jag blev vald till president i
                Chicago men tackade nej till jobbet eftersom jag bara var på genomresa.
                Jag gillar oliver och russin samtidigt.
              </p>
              <p className={styles.text}>
                Jag är en djurviskare, stavhoppsrekordhållare och har en historia utan
                nederlag mot Stockfish i schack. Vid 4 års ålder tog jag mitt
                pilotcertifikat. Jag kan hålla min andedräkt i 21 minuter med full
                mage. När jag är uttråkad skriver jag bokrecensioner på latin med min
                vänster hand och på engelska med min högra. Jag gör en ett minut ägg
                på 45 sekunder och känner till meningen med livet.
              </p>
              <p className={styles.text}>Vill du gå på bio med mig?</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className={styles.panel}>
              <span className={styles.label}>Services</span>
              <p className={styles.text}>
                Open to freelance commissions for individuals &amp; studios. Reach out
                via the contact page for rates and availability.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className={styles.panel}>
              <span className={styles.label}>Software</span>
              <div className={styles.toolsList}>
                {[
                  'Blender',
                  'ZBrush',
                  'Daz3D',
                  'Substance Painter',
                  'Photoshop',
                  'Ableton Live',
                  'FL Studio',
                ].map((tool) => (
                  <span key={tool} className={styles.toolTag}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  )
}
