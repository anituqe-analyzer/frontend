export type VerificationStatus =
  | "pending_ai"
  | "ai_verified_authentic"
  | "ai_verified_fake"
  | "needs_human_verification"
  | "community_verified"
  | "expert_verified"
  | "rejected";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Auction {
  id: number;
  submitted_by_user_id: number;
  external_link: string;
  title: string;
  description_text: string;
  price: number;
  currency: string;
  verification_status: VerificationStatus;
  ai_score_authenticity: number | null;
  ai_uncertainty_message: string | null;
  category_id: number;
  created_at: string;
  updated_at: string;

  // UI helper fields (mocked for now)
  image: string;
  platform: string;
  votes: number;
  votes_authentic: number;
  votes_fake: number;
  timeLeft: string;
}

export interface Comment {
  id: number;
  auction_id: number;
  user_name: string;
  user_avatar?: string;
  is_expert: boolean;
  content: string;
  created_at: string;
}

const CATEGORIES: Category[] = [
  { id: 1, name: "Militaria", slug: "militaria" },
  { id: 2, name: "Biżuteria", slug: "jewelry" },
  { id: 3, name: "Numizmatyka", slug: "numismatics" },
  { id: 4, name: "Malarstwo", slug: "painting" },
  { id: 5, name: "Meble", slug: "furniture" },
  { id: 6, name: "Inne", slug: "other" },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    auction_id: 1,
    user_name: "Marek Nowak",
    is_expert: true,
    content: "Wygląda na oryginał, ale przydałoby się zdjęcie sygnatury.",
    created_at: "2025-11-20T12:00:00Z",
  },
  {
    id: 2,
    auction_id: 1,
    user_name: "Jan Kowalski",
    is_expert: false,
    content: "Mam podobną, ta wygląda ok.",
    created_at: "2025-11-20T13:00:00Z",
  },
  {
    id: 3,
    auction_id: 2,
    user_name: "Anna Wiśniewska",
    is_expert: true,
    content: "Niestety to współczesny odlew. Widać bąbelki powietrza.",
    created_at: "2025-11-22T10:00:00Z",
  },
];

const MOCK_AUCTIONS: Auction[] = [
  {
    id: 1,
    submitted_by_user_id: 101,
    external_link: "https://allegro.pl/oferta/szabla-wz-34",
    title: "Szabla polska wz. 1934 Ludwikówka",
    description_text: "Oryginalna szabla, stan strychowy...",
    price: 4500,
    currency: "PLN",
    verification_status: "expert_verified",
    ai_score_authenticity: 0.98,
    ai_uncertainty_message: null,
    category_id: 1,
    created_at: "2025-11-20T10:00:00Z",
    updated_at: "2025-11-21T12:00:00Z",
    image:
      "https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&auto=format&fit=crop&q=60",
    platform: "Allegro",
    votes: 12,
    votes_authentic: 15,
    votes_fake: 3,
    timeLeft: "2 dni",
  },
  {
    id: 2,
    submitted_by_user_id: 102,
    external_link: "https://olx.pl/oferta/pierscionek",
    title: "Złoty pierścionek z szafirem XIXw.",
    description_text: "Piękny wyrób, próba złota nieczytelna...",
    price: 1200,
    currency: "PLN",
    verification_status: "ai_verified_fake",
    ai_score_authenticity: 0.12,
    ai_uncertainty_message: "Wykryto cechy współczesnego odlewu",
    category_id: 2,
    created_at: "2025-11-22T09:00:00Z",
    updated_at: "2025-11-22T09:05:00Z",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=60",
    platform: "OLX",
    votes: -5,
    votes_authentic: 2,
    votes_fake: 7,
    timeLeft: "5 godz.",
  },
  {
    id: 3,
    submitted_by_user_id: 101,
    external_link: "https://lokalnie.allegro.pl/oferta/maszyna",
    title: "Stara maszyna do pisania Underwood",
    description_text: "Sprawna, wymaga czyszczenia",
    price: 300,
    currency: "PLN",
    verification_status: "pending_ai",
    ai_score_authenticity: 0.45,
    ai_uncertainty_message: "Niska jakość zdjęć",
    category_id: 6,
    created_at: "2025-11-23T15:00:00Z",
    updated_at: "2025-11-23T15:00:00Z",
    image:
      "https://images.unsplash.com/photo-1520223297774-895473945990?w=800&auto=format&fit=crop&q=60",
    platform: "Lokalnie",
    votes: 2,
    votes_authentic: 4,
    votes_fake: 2,
    timeLeft: "1 dzień",
  },
  {
    id: 4,
    submitted_by_user_id: 103,
    external_link: "https://allegro.pl/oferta/moneta",
    title: "Moneta 5 zł 1930 Sztandar",
    description_text: "Stan menniczy, rzadkość",
    price: 25000,
    currency: "PLN",
    verification_status: "community_verified",
    ai_score_authenticity: 0.92,
    ai_uncertainty_message: null,
    category_id: 3,
    created_at: "2025-11-24T11:00:00Z",
    updated_at: "2025-11-25T10:00:00Z",
    image:
      "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=800&auto=format&fit=crop&q=60",
    platform: "Allegro",
    votes: 8,
    votes_authentic: 10,
    votes_fake: 2,
    timeLeft: "3 dni",
  },
];

export const mockApi = {
  getCategories: async (): Promise<Category[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...CATEGORIES]), 300);
    });
  },

  getAuctions: async (filter?: {
    categoryId?: number;
    search?: string;
  }): Promise<Auction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_AUCTIONS];

        if (filter?.categoryId) {
          filtered = filtered.filter(
            (a) => a.category_id === filter.categoryId
          );
        }

        if (filter?.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.title.toLowerCase().includes(searchLower) ||
              a.description_text.toLowerCase().includes(searchLower)
          );
        }

        resolve(filtered);
      }, 500);
    });
  },

  getAuctionById: async (id: number): Promise<Auction | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const auction = MOCK_AUCTIONS.find((a) => a.id === id);
        resolve(auction);
      }, 300);
    });
  },

  createAuction: async (
    data: Omit<
      Auction,
      | "id"
      | "created_at"
      | "updated_at"
      | "verification_status"
      | "ai_score_authenticity"
      | "ai_uncertainty_message"
      | "votes"
      | "votes_authentic"
      | "votes_fake"
      | "timeLeft"
    >
  ): Promise<Auction> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAuction: Auction = {
          ...data,
          id: Math.floor(Math.random() * 10000) + 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          verification_status: "pending_ai",
          ai_score_authenticity: null,
          ai_uncertainty_message: null,
          votes: 0,
          votes_authentic: 0,
          votes_fake: 0,
          timeLeft: "7 dni", // Default mock value
        };
        MOCK_AUCTIONS.unshift(newAuction);
        resolve(newAuction);
      }, 800);
    });
  },

  getComments: async (auctionId: number): Promise<Comment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const comments = MOCK_COMMENTS.filter(
          (c) => c.auction_id === auctionId
        ).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        resolve(comments);
      }, 400);
    });
  },

  addComment: async (
    auctionId: number,
    content: string,
    isExpert: boolean = false
  ): Promise<Comment> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newComment: Comment = {
          id: Math.floor(Math.random() * 10000) + 100,
          auction_id: auctionId,
          user_name: isExpert ? "Ekspert (Ty)" : "Użytkownik (Ty)",
          is_expert: isExpert,
          content: content,
          created_at: new Date().toISOString(),
        };
        MOCK_COMMENTS.unshift(newComment);
        resolve(newComment);
      }, 600);
    });
  },

  voteAuction: async (
    auctionId: number,
    voteType: "authentic" | "fake"
  ): Promise<{ authentic: number; fake: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const auction = MOCK_AUCTIONS.find((a) => a.id === auctionId);
        if (auction) {
          if (voteType === "authentic") {
            auction.votes_authentic += 1;
            auction.votes += 1;
          } else {
            auction.votes_fake += 1;
            auction.votes -= 1;
          }
          resolve({
            authentic: auction.votes_authentic,
            fake: auction.votes_fake,
          });
        } else {
          resolve({ authentic: 0, fake: 0 });
        }
      }, 400);
    });
  },
};
