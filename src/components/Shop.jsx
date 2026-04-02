import { motion } from 'framer-motion';
import styles from './Shop.module.css';

const products = [
  {
    id: 1,
    name: "Ethiopia Yirgacheffe",
    notes: "Floral, Citrus, Honey",
    price: "$24.00",
    image: "/bag1.png"
  },
  {
    id: 2,
    name: "Colombia Supremo",
    notes: "Chocolate, Caramel, Orange",
    price: "$22.00",
    image: "/bag2.png"
  }
];

const Shop = () => {
  return (
    <section className={styles.shopSection} id="shop">
      <div className={`section-container ${styles.container}`}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="serif">Single Origin Series</h2>
          <p>Meticulously sourced, roasted to highlight their intrinsic character.</p>
        </motion.div>

        <div className={styles.grid}>
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              className={styles.card}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className={styles.imageWrapper}>
                <img src={product.image} alt={product.name} className={styles.image} />
                <div className={styles.glow}></div>
              </div>
              <div className={styles.details}>
                <h3 className="serif">{product.name}</h3>
                <p className={styles.notes}>{product.notes}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{product.price}</span>
                  <button className={styles.addBtn}>Add to Cart</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;
