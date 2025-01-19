import smox from "../../assets/team/smox.png";
import badr from "../../assets/team/badr.jpg";
import Soukaina from "../../assets/team/Soukaina.jpeg";
import ouafi from "../../assets/team/ouafi.jpg";
const team = [
  {
    name: 'Bouzagui Badr',
    role: 'Frontend Developer',
    image: badr
  },
  {
    name: 'Joulal Abdelhakim',
    role: 'Frontend Developer',
    image: smox
  },
  {
    name: 'Ouafi Abdeljalil',
    role: 'Backend Developer',
    image: ouafi
  },
  {
    name: 'Soukaina Megdani',
    role: 'Backend Developer',
    image: Soukaina
  },
];

export default function TeamSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="text-center bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
