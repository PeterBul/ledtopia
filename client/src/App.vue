<template>
  <div>
    <core-container size="sm" center>
      <core-flex>
        <core-box px="lg" py="xl">
          <router-link to="/">
            <core-text size="md">LEDTOPIA</core-text>
          </router-link>
        </core-box>
        <core-box
          px="lg"
          py="xl"
          style="
             {
              margin-left: auto;
              width: unset;
            }
          "
        >
          <core-overlay position-x="right">
            <core-button
              variant="transparent"
              @click.prevent
              slot="trigger"
              full
              tabindex="0"
            >
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </core-button>
            <core-menu style="min-width: 150px" slot="content">
              <router-link to="/enums">
                <core-menu-item>
                  <core-text size="md">Enums</core-text>
                </core-menu-item>
              </router-link>
              <router-link to="/controllers">
                <core-menu-item>
                  <core-text size="md">Controllers</core-text>
                </core-menu-item>
              </router-link>
              <router-link to="/blueprint">
                <core-menu-item>
                  <core-text size="md">Blueprint</core-text>
                </core-menu-item>
              </router-link>
            </core-menu>
          </core-overlay>
        </core-box>
      </core-flex>
    </core-container>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {};
</script>
