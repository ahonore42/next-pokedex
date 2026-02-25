import { NextPageWithLayout } from '../_app';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import TeamBuilder from '~/components/teams/TeamBuilder';

const TeamsPage: NextPageWithLayout = () => {
  return (
    <>
      <PageHeading
        pageTitle="Team Builder - Build Your Pokémon Team"
        metaDescription="Build your ideal Pokémon team. Choose 6 Pokémon, assign natures, held items, and up to 4 moves each."
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Team Builder"
        title="Team Builder"
        subtitle="Build your perfect team"
      />
      <PageContent className="max-h-dvh">
        <TeamBuilder />
      </PageContent>
    </>
  );
};

export default TeamsPage;
