<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Chemistry IX</title>
        <link rel="stylesheet" type="text/css" href="styles.css"/>
      </head>
      <body>
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="chapter">
    <h1>
      <xsl:value-of select="@title"/>
    </h1>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="topic">
    <h2>
      <xsl:value-of select="@title"/>
    </h2>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- Add more templates for other elements as needed -->
  <xsl:template match="section">
    <h3>
      <xsl:value-of select="@title"/>
    </h3>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- Default: copy text content -->
  <xsl:template match="paragraph">
    <p>
      <xsl:apply-templates/>
    </p>
  </xsl:template>

  <xsl:template match="text()">
    <xsl:value-of select="."/>
  </xsl:template>
</xsl:stylesheet>