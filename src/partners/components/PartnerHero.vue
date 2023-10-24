<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="PartnerHero">
    <h1 class="title">{{ title || 'Partner di Vue' }}</h1>
    <p class="lead">
      I partner di Vue sono aziende approvate dal team Vue che forniscono
      servizi di prima classe, consulenza e sviluppo Vue. Se la tua azienda
      è interessata a diventare un partner ed essere aggiunta all'elenco per favore
      <a href="https://airtable.com/shrCQhat57SApJI2l" target="_blank"
        >segnala il tuo interesse qui</a
      >.
    </p>
  </div>
</template>

<style scoped>
.PartnerHero {
  padding: 48px 24px;
  text-align: center;
  margin: 0 auto;
  max-width: 688px;
}

@media (min-width: 768px) {
  .PartnerHero {
    padding: 64px 32px;
  }
}

.title,
.lead,
.PartnerHero :deep(.link) {
  transition: color 0.25s;
}

.title {
  line-height: 32px;
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 0.3em;
}

@media (min-width: 768px) {
  .title {
    line-height: 40px;
    font-size: 40px;
  }
}

.lead {
  padding-top: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--vt-c-text-2);
}

.lead a {
  color: var(--vt-c-brand);
}

.PartnerHero :deep(.link) {
  color: var(--vt-c-brand);
}

.PartnerHero :deep(.link:hover) {
  color: var(--vt-c-brand-dark);
}
</style>
