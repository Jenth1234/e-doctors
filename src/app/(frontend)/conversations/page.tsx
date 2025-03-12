import { getDoctors } from '@/actions/doctors'
import ExpandingCard from '@/components/ExpandingCard'
import { getServerSideUser } from '@/get-serverside-user'
import { redirect } from 'next/navigation'

export default async function Page() {
  const {user} = await getServerSideUser()

  if (!user) {
    redirect('/login')
  }

  if(user.roles.includes('doctor')) {
    redirect('/conversations/respondent')
  }

  const doctors = await getDoctors() ?? []

  return (
    <div className="container p-10 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Medical Companion</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-5 mr-5">
        {doctors.map((doctor, index) => (
          <ExpandingCard
            key={index}
            name={doctor.name}
            avatar={doctor?.avatar ?? null}
            id={doctor.id}
          />
        ))}
      </div>
    </div>
  )
}
