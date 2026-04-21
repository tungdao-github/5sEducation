import { translations as baseTranslations, type Language as BaseLanguage } from "./translations";

export type Language = BaseLanguage | "es" | "fr";

function cloneTranslation<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const es = cloneTranslation(baseTranslations.en);
const fr = cloneTranslation(baseTranslations.en);

// Core navigation
es.nav.home = "Inicio";
es.nav.courses = "Cursos";
es.nav.categories = "Categorías";
es.nav.blog = "Blog";
es.nav.about = "Acerca de";
es.nav.search = "Buscar";
es.nav.cart = "Carrito";
es.nav.wishlist = "Favoritos";
es.nav.account = "Cuenta";
es.nav.login = "Iniciar sesión";
es.nav.register = "Registrarse";
es.nav.logout = "Cerrar sesión";
es.nav.admin = "Administración";
es.nav.compare = "Comparar";
es.nav.myLearning = "Mi aprendizaje";

fr.nav.home = "Accueil";
fr.nav.courses = "Cours";
fr.nav.categories = "Catégories";
fr.nav.blog = "Blog";
fr.nav.about = "À propos";
fr.nav.search = "Recherche";
fr.nav.cart = "Panier";
fr.nav.wishlist = "Favoris";
fr.nav.account = "Compte";
fr.nav.login = "Connexion";
fr.nav.register = "Inscription";
fr.nav.logout = "Déconnexion";
fr.nav.admin = "Admin";
fr.nav.compare = "Comparer";
fr.nav.myLearning = "Mon apprentissage";

// Very visible shell labels
es.common.loading = "Cargando...";
es.common.error = "Ocurrió un error";
es.common.submit = "Enviar";
es.common.back = "Volver";
es.common.close = "Cerrar";
es.common.confirm = "Confirmar";
es.common.search = "Buscar";
es.common.filter = "Filtrar";
es.common.sort = "Ordenar";
es.common.all = "Todos";
es.common.free = "Gratis";
es.common.paid = "De pago";
es.common.beginner = "Principiante";
es.common.intermediate = "Intermedio";
es.common.advanced = "Avanzado";

fr.common.loading = "Chargement...";
fr.common.error = "Une erreur est survenue";
fr.common.submit = "Envoyer";
fr.common.back = "Retour";
fr.common.close = "Fermer";
fr.common.confirm = "Confirmer";
fr.common.search = "Recherche";
fr.common.filter = "Filtrer";
fr.common.sort = "Trier";
fr.common.all = "Tous";
fr.common.free = "Gratuit";
fr.common.paid = "Payant";
fr.common.beginner = "Débutant";
fr.common.intermediate = "Intermédiaire";
fr.common.advanced = "Avancé";

// Auth labels
es.auth.loginTitle = "Iniciar sesión";
es.auth.registerTitle = "Crear cuenta";
es.auth.forgotTitle = "Olvidé mi contraseña";
es.auth.loginBtn = "Entrar";
es.auth.registerBtn = "Registrarse";
es.auth.forgotBtn = "Enviar enlace";
es.auth.noAccount = "¿No tienes cuenta?";
es.auth.hasAccount = "¿Ya tienes cuenta?";
es.auth.forgotLink = "¿Olvidaste tu contraseña?";
es.auth.loginWithGoogle = "Entrar con Google";
es.auth.loginWithFacebook = "Entrar con Facebook";

fr.auth.loginTitle = "Connexion";
fr.auth.registerTitle = "Créer un compte";
fr.auth.forgotTitle = "Mot de passe oublié";
fr.auth.loginBtn = "Connexion";
fr.auth.registerBtn = "Inscription";
fr.auth.forgotBtn = "Envoyer le lien";
fr.auth.noAccount = "Pas encore de compte ?";
fr.auth.hasAccount = "Vous avez déjà un compte ?";
fr.auth.forgotLink = "Mot de passe oublié ?";
fr.auth.loginWithGoogle = "Se connecter avec Google";
fr.auth.loginWithFacebook = "Se connecter avec Facebook";

// Keep richer pages readable with a few important overrides.
es.home.heroTitle = "Descubre los mejores cursos de UX/UI Design";
es.home.heroSubtitle = "Mejora tus habilidades con cursos de expertos líderes de la industria";
es.home.searchPlaceholder = "Buscar cursos, instructores...";
es.home.featuredCourses = "Cursos destacados";
es.home.viewAll = "Ver todo";
es.home.popularCategories = "Categorías populares";
es.home.latestBlog = "Últimas noticias";
es.home.testimonials = "Lo que dicen los estudiantes";
es.home.ctaTitle = "Empieza tu viaje de aprendizaje hoy";
es.home.ctaSubtitle = "Regístrate ahora para obtener descuentos especiales";
es.home.ctaButton = "Explorar ahora";

fr.home.heroTitle = "Découvrez les meilleurs cours de UX/UI Design";
fr.home.heroSubtitle = "Développez vos compétences avec des cours d’experts reconnus";
fr.home.searchPlaceholder = "Rechercher des cours, formateurs...";
fr.home.featuredCourses = "Cours en vedette";
fr.home.viewAll = "Voir tout";
fr.home.popularCategories = "Catégories populaires";
fr.home.latestBlog = "Dernières actualités";
fr.home.testimonials = "Ce que disent les étudiants";
fr.home.ctaTitle = "Commencez votre apprentissage dès aujourd’hui";
fr.home.ctaSubtitle = "Inscrivez-vous pour bénéficier d’offres spéciales";
fr.home.ctaButton = "Explorer";

export const translations = {
  ...baseTranslations,
  es,
  fr,
} as const;

