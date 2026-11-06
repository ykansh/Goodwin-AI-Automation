import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00843D',
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00843D',
    marginBottom: 4,
  },
  docType: {
    fontSize: 10,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logo: {
    width: 30,
    height: 35,
  },
  productSection: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 30,
  },
  productImageContainer: {
    width: '40%',
    height: 180,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    objectFit: 'contain',
    width: '100%',
    height: '100%',
  },
  productInfo: {
    width: '60%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  series: {
    fontSize: 10,
    color: '#00843D',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1D20',
    marginBottom: 10,
  },
  description: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.5,
    marginBottom: 15,
  },
  highlightsBox: {
    flexDirection: 'row',
    gap: 10,
  },
  highlight: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    width: '33%',
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 8,
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1D20',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1D20',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingBottom: 5,
    marginBottom: 15,
    marginTop: 10,
  },
  table: {
    flexDirection: 'column',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '40%',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#E9ECEF',
  },
  tableColValue: {
    width: '60%',
    padding: 8,
  },
  tableTextHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
  },
  tableTextValue: {
    fontSize: 10,
    color: '#1A1D20',
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  listItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: '#00843D',
    borderRadius: 2,
    marginRight: 8,
  },
  listItemText: {
    fontSize: 10,
    color: '#444444',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
  },
  footerBold: {
    fontWeight: 'bold',
    color: '#1A1D20',
  }
});

interface Product {
  id: string;
  name: string;
  series?: string;
  slug: string;
  voltage?: string;
  ah?: string;
  cca?: string;
  category: string;
  technology?: string;
  application?: string[];
  warranty?: string;
  warranty_breakdown?: string;
  warranty_options?: string[];
  image: string;
  description?: string;
  dimensions?: string;
  weight?: string;
  terminalLayout?: string;
  features?: string[];
}

export const ProductDatasheetPDF = ({ product, logoPath, imagePath }: { product: Product, logoPath: string, imagePath: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>GOODWIN BATTERIES</Text>
          <Text style={styles.docType}>Product Specification Sheet</Text>
        </View>
        <Image style={styles.logo} src={logoPath} />
      </View>

      {/* PRODUCT OVERVIEW */}
      <View style={styles.productSection}>
        <View style={styles.productImageContainer}>
          <Image style={styles.productImage} src={imagePath} />
        </View>
        <View style={styles.productInfo}>
          {product.series && <Text style={styles.series}>{product.series}</Text>}
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>{product.description || "High-performance Goodwin battery engineered for dependable reliability."}</Text>
          
          <View style={styles.highlightsBox}>
            {product.ah && (
              <View style={styles.highlight}>
                <Text style={styles.highlightLabel}>Capacity</Text>
                <Text style={styles.highlightValue}>{product.ah}</Text>
              </View>
            )}
            {product.voltage && (
              <View style={styles.highlight}>
                <Text style={styles.highlightLabel}>Voltage</Text>
                <Text style={styles.highlightValue}>{product.voltage}</Text>
              </View>
            )}
            <View style={styles.highlight}>
              <Text style={styles.highlightLabel}>Warranty</Text>
              <Text style={styles.highlightValue}>{product.warranty || "Standard"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* TECHNICAL SPECIFICATIONS */}
      <Text style={styles.sectionTitle}>TECHNICAL SPECIFICATIONS</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Model Number</Text></View>
          <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.name}</Text></View>
        </View>
        {product.technology && (
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Technology</Text></View>
            <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.technology}</Text></View>
          </View>
        )}
        {product.ah && (
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Capacity (Ah)</Text></View>
            <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.ah}</Text></View>
          </View>
        )}
        {product.voltage && (
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Voltage</Text></View>
            <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.voltage}</Text></View>
          </View>
        )}
        {product.cca && product.cca !== "N/A" && (
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>CCA</Text></View>
            <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.cca}</Text></View>
          </View>
        )}
        {product.dimensions && (
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Dimensions (LxWxH)</Text></View>
            <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.dimensions}</Text></View>
          </View>
        )}
        {product.weight && (
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Weight</Text></View>
            <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.weight}</Text></View>
          </View>
        )}
        {product.terminalLayout && (
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Terminal Layout</Text></View>
            <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.terminalLayout}</Text></View>
          </View>
        )}
        <View style={styles.tableRowLast}>
          <View style={styles.tableColHeader}><Text style={styles.tableTextHeader}>Warranty Coverage</Text></View>
          <View style={styles.tableColValue}><Text style={styles.tableTextValue}>{product.warranty_breakdown || product.warranty || "Standard"}</Text></View>
        </View>
      </View>

      {/* APPLICATIONS & FEATURES */}
      <View style={{ flexDirection: 'row', gap: 30 }}>
        {product.application && product.application.length > 0 && (
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>SUITABLE APPLICATIONS</Text>
            <View style={{ flexDirection: 'column', gap: 6 }}>
              {product.application.map((app, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.bullet} />
                  <Text style={styles.listItemText}>{app}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {product.features && product.features.length > 0 && (
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>KEY FEATURES</Text>
            <View style={{ flexDirection: 'column', gap: 6 }}>
              {product.features.map((feature, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.bullet} />
                  <Text style={styles.listItemText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={{ flexDirection: 'column', gap: 4 }}>
          <Text style={styles.footerText}><Text style={styles.footerBold}>GOODWIN BATTERIES</Text> | India's Everyday Power Choice</Text>
          <Text style={styles.footerText}>Phone: +91 96677 24411 | Web: www.goodwinbatteries.com</Text>
        </View>
        <Text style={styles.footerText}>Page 1 of 1</Text>
      </View>

    </Page>
  </Document>
);

export default ProductDatasheetPDF;
